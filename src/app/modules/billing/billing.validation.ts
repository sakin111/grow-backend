import { z } from "zod";

const createCreditCheckoutSchema = z.object({
  body: z.object({
    package: z.enum(["100", "500"]),
  }),
});

const createConnectOnboardingSchema = z.object({
  body: z.object({
    country: z.string().length(2).regex(/^[A-Za-z]{2}$/, "Country must be a two-letter ISO code"),
  }),
});

export const BillingValidation = {
  createCreditCheckoutSchema,
  createConnectOnboardingSchema,
};
