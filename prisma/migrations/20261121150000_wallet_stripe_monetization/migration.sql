CREATE TYPE "CreditLotSource" AS ENUM ('SIGNUP_BONUS', 'PURCHASE');

ALTER TABLE "user"
ADD COLUMN "creditBalance" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "mentor_profile"
ADD COLUMN "stripeAccountId" TEXT,
ADD COLUMN "stripeCustomerId" TEXT,
ADD COLUMN "stripeSubscriptionId" TEXT,
ADD COLUMN "stripeSubscriptionStatus" TEXT,
ADD COLUMN "subscriptionPeriodEnd" TIMESTAMP(3),
ADD COLUMN "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "session_booking"
ADD COLUMN "creditsCharged" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "credit_lot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "CreditLotSource" NOT NULL,
    "totalCredits" INTEGER NOT NULL,
    "remainingCredits" INTEGER NOT NULL,
    "netRevenueCents" INTEGER NOT NULL DEFAULT 0,
    "remainingNetRevenueCents" INTEGER NOT NULL DEFAULT 0,
    "stripeCheckoutSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_lot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "credit_payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkoutSessionId" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "creditAmount" INTEGER NOT NULL,
    "grossAmountCents" INTEGER NOT NULL,
    "netRevenueCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "booking_credit_allocation" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "creditLotId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "netRevenueCents" INTEGER NOT NULL,
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_credit_allocation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mentor_payout" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "stripeTransferId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_payout_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stripe_event" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "mentor_profile_stripeAccountId_key" ON "mentor_profile"("stripeAccountId");
CREATE UNIQUE INDEX "mentor_profile_stripeSubscriptionId_key" ON "mentor_profile"("stripeSubscriptionId");
CREATE INDEX "credit_lot_userId_createdAt_idx" ON "credit_lot"("userId", "createdAt");
CREATE UNIQUE INDEX "credit_lot_stripeCheckoutSessionId_key" ON "credit_lot"("stripeCheckoutSessionId");
CREATE UNIQUE INDEX "credit_payment_checkoutSessionId_key" ON "credit_payment"("checkoutSessionId");
CREATE UNIQUE INDEX "credit_payment_paymentIntentId_key" ON "credit_payment"("paymentIntentId");
CREATE UNIQUE INDEX "booking_credit_allocation_bookingId_creditLotId_key" ON "booking_credit_allocation"("bookingId", "creditLotId");
CREATE UNIQUE INDEX "mentor_payout_bookingId_key" ON "mentor_payout"("bookingId");
CREATE UNIQUE INDEX "mentor_payout_stripeTransferId_key" ON "mentor_payout"("stripeTransferId");

ALTER TABLE "credit_lot"
ADD CONSTRAINT "credit_lot_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "credit_payment"
ADD CONSTRAINT "credit_payment_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "booking_credit_allocation"
ADD CONSTRAINT "booking_credit_allocation_bookingId_fkey"
FOREIGN KEY ("bookingId") REFERENCES "session_booking"("id") ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT "booking_credit_allocation_creditLotId_fkey"
FOREIGN KEY ("creditLotId") REFERENCES "credit_lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "mentor_payout"
ADD CONSTRAINT "mentor_payout_bookingId_fkey"
FOREIGN KEY ("bookingId") REFERENCES "session_booking"("id") ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT "mentor_payout_mentorId_fkey"
FOREIGN KEY ("mentorId") REFERENCES "mentor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
