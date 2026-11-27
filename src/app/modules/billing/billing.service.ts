import { CreditLotSource, Prisma } from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status";
import { envVar } from "../../config/envVar";

type CreditPackage = "100" | "500";

const creditPackages: Record<CreditPackage, {
  credits: number;
  amountCents: number;
  priceId?: string;
}> = {
  "100": {
    credits: 100,
    amountCents: 1000,
    priceId: envVar.STRIPE_CREDIT_PACK_100_PRICE_ID,
  },
  "500": {
    credits: 500,
    amountCents: 4000,
    priceId: envVar.STRIPE_CREDIT_PACK_500_PRICE_ID,
  },
};

let stripeClient: Stripe | undefined;

const getStripe = () => {
  if (!envVar.STRIPE_SECRET_KEY) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Stripe is not configured");
  }

  stripeClient ??= new Stripe(envVar.STRIPE_SECRET_KEY);
  return stripeClient;
};

const configuredPriceId = (priceId: string | undefined, label: string) => {
  if (!priceId) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `${label} Stripe Price ID is not configured`);
  }
  return priceId;
};

const validatePrice = async (
  stripe: Stripe,
  priceId: string,
  amountCents: number,
  recurring: boolean,
) => {
  const price = await stripe.prices.retrieve(priceId);
  if (
    !price.active ||
    price.currency !== "usd" ||
    price.unit_amount !== amountCents ||
    (recurring ? price.recurring?.interval !== "month" || price.recurring.interval_count !== 1 : price.type !== "one_time")
  ) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Stripe Price configuration does not match the configured product",
    );
  }
  return price;
};

const lockUserBalance = async (tx: Prisma.TransactionClient, userId: string) => {
  await tx.$queryRaw`SELECT "id" FROM "user" WHERE "id" = ${userId} FOR UPDATE`;
};

export const grantSignupCredits = async (
  tx: Prisma.TransactionClient,
  userId: string,
  credits: number,
) => {
  if (credits <= 0) return;

  await tx.creditLot.create({
    data: {
      userId,
      source: CreditLotSource.SIGNUP_BONUS,
      totalCredits: credits,
      remainingCredits: credits,
    },
  });
};

export const chargeBookingCredits = async (
  tx: Prisma.TransactionClient,
  userId: string,
  bookingId: string,
  credits: number,
) => {
  await lockUserBalance(tx, userId);

  const debit = await tx.user.updateMany({
    where: { id: userId, creditBalance: { gte: credits } },
    data: { creditBalance: { decrement: credits } },
  });

  if (debit.count !== 1) {
    throw new AppError(httpStatus.PAYMENT_REQUIRED, "Insufficient credits to book this mentor");
  }

  const lots = await tx.creditLot.findMany({
    where: { userId, remainingCredits: { gt: 0 } },
    orderBy: { createdAt: "asc" },
  });
  let creditsRemaining = credits;

  const orderedLots = [...lots].sort((a, b) => {
    if (a.source !== b.source) {
      return a.source === CreditLotSource.SIGNUP_BONUS ? -1 : 1;
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  for (const lot of orderedLots) {
    if (creditsRemaining === 0) break;

    const creditsUsed = Math.min(lot.remainingCredits, creditsRemaining);
    const netRevenueUsed =
      creditsUsed === lot.remainingCredits
        ? lot.remainingNetRevenueCents
        : Math.floor((lot.remainingNetRevenueCents * creditsUsed) / lot.remainingCredits);

    await tx.creditLot.update({
      where: { id: lot.id },
      data: {
        remainingCredits: { decrement: creditsUsed },
        remainingNetRevenueCents: { decrement: netRevenueUsed },
      },
    });
    await tx.bookingCreditAllocation.create({
      data: {
        bookingId,
        creditLotId: lot.id,
        credits: creditsUsed,
        netRevenueCents: netRevenueUsed,
      },
    });
    creditsRemaining -= creditsUsed;
  }

  if (creditsRemaining !== 0) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Credit balance does not match available credit lots",
    );
  }
};

export const refundBookingCredits = async (
  tx: Prisma.TransactionClient,
  userId: string,
  bookingId: string,
) => {
  await lockUserBalance(tx, userId);

  const allocations = await tx.bookingCreditAllocation.findMany({
    where: { bookingId, refundedAt: null },
  });
  const creditsToRefund = allocations.reduce((sum, allocation) => sum + allocation.credits, 0);

  for (const allocation of allocations) {
    await tx.creditLot.update({
      where: { id: allocation.creditLotId },
      data: {
        remainingCredits: { increment: allocation.credits },
        remainingNetRevenueCents: { increment: allocation.netRevenueCents },
      },
    });
    await tx.bookingCreditAllocation.update({
      where: { id: allocation.id },
      data: { refundedAt: new Date() },
    });
  }

  if (creditsToRefund > 0) {
    await tx.user.update({
      where: { id: userId },
      data: { creditBalance: { increment: creditsToRefund } },
    });
  }
};

export const createCreditCheckout = async (userId: string, pack: CreditPackage) => {
  const stripe = getStripe();
  const configuredPack = creditPackages[pack];
  const priceId = configuredPriceId(configuredPack.priceId, `${pack}-credit package`);
  await validatePrice(stripe, priceId, configuredPack.amountCents, false);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: { userId: user.id, creditPackage: pack },
    payment_intent_data: {
      metadata: { userId: user.id, creditPackage: pack },
    },
    success_url: `${envVar.FRONTEND_URL}/wallet?purchase=success`,
    cancel_url: `${envVar.FRONTEND_URL}/wallet?purchase=cancelled`,
  });

  if (!session.url) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Stripe did not return a checkout URL");
  }
  return { url: session.url };
};

export const createMentorSubscriptionCheckout = async (userId: string) => {
  const stripe = getStripe();
  const priceId = configuredPriceId(
    envVar.STRIPE_MENTOR_MONTHLY_PRICE_ID,
    "Mentor subscription",
  );
  await validatePrice(stripe, priceId, 500, true);

  const profile = await prisma.mentorProfile.findUnique({
    where: { userId },
    include: { user: { select: { email: true } } },
  });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Mentor profile not found");
  }
  if (profile.stripeSubscriptionStatus === "active") {
    throw new AppError(httpStatus.BAD_REQUEST, "Mentor subscription is already active");
  }

  let customerId = profile.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.user.email,
      metadata: { mentorProfileId: profile.id, userId },
    });
    customerId = customer.id;
    await prisma.mentorProfile.update({
      where: { id: profile.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: customerId,
    client_reference_id: userId,
    metadata: { mentorProfileId: profile.id, userId },
    subscription_data: { metadata: { mentorProfileId: profile.id, userId } },
    success_url: `${envVar.FRONTEND_URL}/mentor/billing?subscription=success`,
    cancel_url: `${envVar.FRONTEND_URL}/mentor/billing?subscription=cancelled`,
  });

  if (!session.url) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Stripe did not return a checkout URL");
  }
  return { url: session.url };
};

export const createMentorBillingPortal = async (userId: string) => {
  const stripe = getStripe();
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Mentor profile not found");
  }
  if (!profile.stripeCustomerId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Mentor does not have a Stripe subscription");
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: profile.stripeCustomerId,
    return_url: `${envVar.FRONTEND_URL}/mentor/billing`,
  });
  return { url: portal.url };
};

export const createMentorConnectOnboarding = async (userId: string, country: string) => {
  const stripe = getStripe();
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId },
    include: { user: { select: { email: true } } },
  });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Mentor profile not found");
  }
  if (profile.payoutsEnabled) {
    throw new AppError(httpStatus.BAD_REQUEST, "Mentor payout account is already enabled");
  }

  let accountId = profile.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: country.toUpperCase(),
      email: profile.user.email,
      capabilities: { transfers: { requested: true } },
      metadata: { mentorProfileId: profile.id, userId },
    });
    accountId = account.id;
    await prisma.mentorProfile.update({
      where: { id: profile.id },
      data: { stripeAccountId: accountId },
    });
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${envVar.FRONTEND_URL}/mentor/billing/connect?refresh=1`,
    return_url: `${envVar.FRONTEND_URL}/mentor/billing/connect?return=1`,
    type: "account_onboarding",
  });
  return { url: link.url };
};

export const getWallet = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditBalance: true },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const payments = await prisma.creditPayment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      creditAmount: true,
      grossAmountCents: true,
      currency: true,
      createdAt: true,
    },
  });
  return { balance: user.creditBalance, purchases: payments };
};

export const getMentorBillingStatus = async (userId: string) => {
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId },
    select: {
      stripeSubscriptionStatus: true,
      subscriptionPeriodEnd: true,
      payoutsEnabled: true,
      stripeAccountId: true,
    },
  });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Mentor profile not found");
  }

  let payoutsEnabled = profile.payoutsEnabled;
  if (profile.stripeAccountId) {
    const account = await getStripe().accounts.retrieve(profile.stripeAccountId);
    payoutsEnabled = account.payouts_enabled;
    if (payoutsEnabled !== profile.payoutsEnabled) {
      await prisma.mentorProfile.update({
        where: { userId },
        data: { payoutsEnabled },
      });
    }
  }

  return {
    subscriptionStatus: profile.stripeSubscriptionStatus,
    subscriptionPeriodEnd: profile.subscriptionPeriodEnd,
    payoutsEnabled,
    hasPayoutAccount: Boolean(profile.stripeAccountId),
  };
};

const paymentNetRevenue = async (stripe: Stripe, paymentIntentId: string) => {
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["latest_charge.balance_transaction"],
  });
  let charge = intent.latest_charge;
  if (typeof charge === "string") {
    charge = await stripe.charges.retrieve(charge, { expand: ["balance_transaction"] });
  }
  if (!charge || typeof charge === "string" || !charge.balance_transaction) {
    throw new Error("Stripe payment has no balance transaction");
  }

  let balanceTransaction = charge.balance_transaction;
  if (typeof balanceTransaction === "string") {
    balanceTransaction = await stripe.balanceTransactions.retrieve(balanceTransaction);
  }
  return balanceTransaction.net;
};

const processCreditPurchase = async (
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) => {
  const userId = session.metadata?.userId;
  const pack = session.metadata?.creditPackage as CreditPackage | undefined;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (
    !userId ||
    !pack ||
    !(pack in creditPackages) ||
    !paymentIntentId ||
    session.payment_status !== "paid"
  ) {
    throw new Error("Stripe credit checkout session is missing required payment details");
  }

  const configuredPack = creditPackages[pack];
  const priceId = configuredPriceId(configuredPack.priceId, `${pack}-credit package`);
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 2 });
  if (
    lineItems.data.length !== 1 ||
    lineItems.data[0].quantity !== 1 ||
    lineItems.data[0].price?.id !== priceId
  ) {
    throw new Error("Stripe credit checkout session does not match its configured package");
  }
  if (session.currency !== "usd" || session.amount_total !== configuredPack.amountCents) {
    throw new Error("Stripe credit checkout amount does not match its configured package");
  }

  const netRevenueCents = await paymentNetRevenue(stripe, paymentIntentId);
  if (netRevenueCents < 0) {
    throw new Error("Stripe payment has a negative net balance");
  }

  return {
    userId,
    pack,
    paymentIntentId,
    netRevenueCents,
    grossAmountCents: session.amount_total,
    checkoutSessionId: session.id,
  };
};

const updateSubscription = async (
  tx: Prisma.TransactionClient,
  subscription: Stripe.Subscription,
) => {
  const mentorProfileId = subscription.metadata.mentorProfileId;
  const periodEnd = subscription.items.data[0]?.current_period_end;
  const update = {
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
    stripeSubscriptionStatus: subscription.status,
    subscriptionPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
  };

  if (mentorProfileId) {
    await tx.mentorProfile.updateMany({
      where: { id: mentorProfileId },
      data: update,
    });
  } else {
    await tx.mentorProfile.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: update,
    });
  }
};

const saveStripeEvent = async (
  event: Stripe.Event,
  purchase?: Awaited<ReturnType<typeof processCreditPurchase>>,
  subscription?: Stripe.Subscription,
  fallbackMentorProfileId?: string,
  account?: Stripe.Account,
) => {
  await prisma.$transaction(async (tx) => {
    await tx.stripeEvent.create({
      data: { id: event.id, type: event.type },
    });

    if (purchase) {
      await lockUserBalance(tx, purchase.userId);
      await tx.creditPayment.create({
        data: {
          userId: purchase.userId,
          checkoutSessionId: purchase.checkoutSessionId,
          paymentIntentId: purchase.paymentIntentId,
          creditAmount: creditPackages[purchase.pack].credits,
          grossAmountCents: purchase.grossAmountCents,
          netRevenueCents: purchase.netRevenueCents,
          currency: "usd",
        },
      });
      await tx.creditLot.create({
        data: {
          userId: purchase.userId,
          source: CreditLotSource.PURCHASE,
          totalCredits: creditPackages[purchase.pack].credits,
          remainingCredits: creditPackages[purchase.pack].credits,
          netRevenueCents: purchase.netRevenueCents,
          remainingNetRevenueCents: purchase.netRevenueCents,
          stripeCheckoutSessionId: purchase.checkoutSessionId,
        },
      });
      await tx.user.update({
        where: { id: purchase.userId },
        data: { creditBalance: { increment: creditPackages[purchase.pack].credits } },
      });
    }

    if (subscription) {
      if (fallbackMentorProfileId && !subscription.metadata.mentorProfileId) {
        await tx.mentorProfile.updateMany({
          where: { id: fallbackMentorProfileId },
          data: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId:
              typeof subscription.customer === "string"
                ? subscription.customer
                : subscription.customer.id,
            stripeSubscriptionStatus: subscription.status,
            subscriptionPeriodEnd: subscription.items.data[0]?.current_period_end
              ? new Date(subscription.items.data[0].current_period_end * 1000)
              : null,
          },
        });
      } else {
        await updateSubscription(tx, subscription);
      }
    }

    if (account) {
      await tx.mentorProfile.updateMany({
        where: { stripeAccountId: account.id },
        data: { payoutsEnabled: account.payouts_enabled },
      });
    }
  });
};

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

export const handleStripeWebhook = async (rawBody: Buffer, signature: string | undefined) => {
  const stripe = getStripe();
  if (!envVar.STRIPE_WEBHOOK_SECRET) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Stripe webhook is not configured");
  }
  if (!signature) {
    throw new AppError(httpStatus.BAD_REQUEST, "Stripe signature is required");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, envVar.STRIPE_WEBHOOK_SECRET);
  } catch {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid Stripe webhook signature");
  }

  if (await prisma.stripeEvent.findUnique({ where: { id: event.id }, select: { id: true } })) {
    return { received: true };
  }

  let purchase: Awaited<ReturnType<typeof processCreditPurchase>> | undefined;
  let subscription: Stripe.Subscription | undefined;
  let fallbackMentorProfileId: string | undefined;
  let account: Stripe.Account | undefined;

  if (
    (event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded") &&
    (event.data.object as Stripe.Checkout.Session).mode === "payment"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      purchase = await processCreditPurchase(stripe, session);
    }
  } else if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode === "subscription") {
      fallbackMentorProfileId = session.metadata?.mentorProfileId;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (subscriptionId) {
        subscription = await stripe.subscriptions.retrieve(subscriptionId);
      }
    }
  } else if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    subscription = event.data.object as Stripe.Subscription;
  } else if (event.type === "account.updated") {
    account = event.data.object as Stripe.Account;
  }

  try {
    await saveStripeEvent(event, purchase, subscription, fallbackMentorProfileId, account);
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;

    const [existingEvent, existingPayment] = await Promise.all([
      prisma.stripeEvent.findUnique({ where: { id: event.id }, select: { id: true } }),
      purchase
        ? prisma.creditPayment.findUnique({
            where: { checkoutSessionId: purchase.checkoutSessionId },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);
    if (!existingEvent && !existingPayment) throw error;
  }

  return { received: true };
};

export const createMentorPayout = async (bookingId: string, mentorProfileId: string) => {
  const booking = await prisma.sessionBooking.findUnique({
    where: { id: bookingId },
    include: {
      mentor: true,
      creditAllocations: { where: { refundedAt: null } },
    },
  });
  if (!booking || booking.mentorId !== mentorProfileId) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  const netRevenueCents = booking.creditAllocations.reduce(
    (sum, allocation) => sum + allocation.netRevenueCents,
    0,
  );
  const amountCents = Math.floor((netRevenueCents * 30) / 100);
  if (amountCents <= 0) return null;
  const stripe = getStripe();

  const account = booking.mentor.stripeAccountId;
  if (!account) {
    throw new AppError(httpStatus.CONFLICT, "Mentor must finish Stripe payout onboarding");
  }

  const stripeAccount = await stripe.accounts.retrieve(account);
  if (!stripeAccount.payouts_enabled) {
    throw new AppError(httpStatus.CONFLICT, "Mentor Stripe payout account is not enabled");
  }

  const transfer = await stripe.transfers.create(
    {
      amount: amountCents,
      currency: "usd",
      destination: account,
      transfer_group: bookingId,
      metadata: { bookingId, mentorProfileId },
    },
    { idempotencyKey: `mentor-session-payout-${bookingId}` },
  );

  return { id: transfer.id, amountCents };
};

export const BillingServices = {
  createCreditCheckout,
  createMentorSubscriptionCheckout,
  createMentorBillingPortal,
  createMentorConnectOnboarding,
  getWallet,
  getMentorBillingStatus,
  handleStripeWebhook,
  createMentorPayout,
};
