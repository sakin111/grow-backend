import { Router } from "express";
import { Role } from "@prisma/client";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { BillingControllers } from "./billing.controller";
import { BillingValidation } from "./billing.validation";

const router = Router();

router.post("/webhook", BillingControllers.webhook);
router.get("/wallet", checkAuth(Role.OWNER), BillingControllers.getWallet);
router.post(
  "/credits/checkout",
  checkAuth(Role.OWNER),
  validateRequest(BillingValidation.createCreditCheckoutSchema),
  BillingControllers.createCreditCheckout,
);
router.post(
  "/mentor/subscription-checkout",
  checkAuth(Role.MENTOR),
  BillingControllers.createMentorSubscriptionCheckout,
);
router.post(
  "/mentor/portal",
  checkAuth(Role.MENTOR),
  BillingControllers.createMentorBillingPortal,
);
router.post(
  "/mentor/connect/onboarding",
  checkAuth(Role.MENTOR),
  validateRequest(BillingValidation.createConnectOnboardingSchema),
  BillingControllers.createMentorConnectOnboarding,
);
router.get(
  "/mentor/status",
  checkAuth(Role.MENTOR),
  BillingControllers.getMentorBillingStatus,
);

export const billingRouter = router;
