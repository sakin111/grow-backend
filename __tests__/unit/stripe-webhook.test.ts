import request from "supertest";
import { app } from "../../src/app";
import { BillingServices } from "../../src/app/modules/billing/billing.service";

describe("Stripe webhook", () => {
  it("passes the raw body to the handler on the configured endpoint", async () => {
    const handleStripeWebhook = jest
      .spyOn(BillingServices, "handleStripeWebhook")
      .mockResolvedValue({ received: true });
    const payload = { type: "test.event" };

    const response = await request(app)
      .post("/api/v1/stripe/webhook")
      .set("stripe-signature", "test-signature")
      .send(payload);

    expect(response.status).toBe(200);
    expect(handleStripeWebhook).toHaveBeenCalledTimes(1);
    const [rawBody] = handleStripeWebhook.mock.calls[0];
    expect(Buffer.isBuffer(rawBody)).toBe(true);
    expect(JSON.parse(rawBody.toString())).toEqual(payload);
  });
});
