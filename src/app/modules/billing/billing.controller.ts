import { Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../../errorHelper/AppError";
import CatchAsync from "../../shared/CatchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { BillingServices } from "./billing.service";
import { IJwtPayload } from "../session/session.interface";

type BillingRequest = Request & { rawBody?: Buffer };

const createCreditCheckout = CatchAsync(async (req: Request, res: Response) => {
  const result = await BillingServices.createCreditCheckout(
    (req.user as IJwtPayload).id,
    req.body.package,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Credit checkout created",
    data: result,
  });
});

const getWallet = CatchAsync(async (req: Request, res: Response) => {
  const result = await BillingServices.getWallet((req.user as IJwtPayload).id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Wallet retrieved",
    data: result,
  });
});

const createMentorSubscriptionCheckout = CatchAsync(
  async (req: Request, res: Response) => {
    const result = await BillingServices.createMentorSubscriptionCheckout(
      (req.user as IJwtPayload).id,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Mentor subscription checkout created",
      data: result,
    });
  },
);

const createMentorBillingPortal = CatchAsync(
  async (req: Request, res: Response) => {
    const result = await BillingServices.createMentorBillingPortal(
      (req.user as IJwtPayload).id,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Mentor billing portal created",
      data: result,
    });
  },
);

const createMentorConnectOnboarding = CatchAsync(
  async (req: Request, res: Response) => {
    const result = await BillingServices.createMentorConnectOnboarding(
      (req.user as IJwtPayload).id,
      req.body.country,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Stripe payout onboarding created",
      data: result,
    });
  },
);

const getMentorBillingStatus = CatchAsync(
  async (req: Request, res: Response) => {
    const result = await BillingServices.getMentorBillingStatus((req.user as IJwtPayload).id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Mentor billing status retrieved",
      data: result,
    });
  },
);

const webhook = CatchAsync(async (req: BillingRequest, res: Response) => {
  if (!req.rawBody) {
    throw new AppError(httpStatus.BAD_REQUEST, "Stripe webhook body is missing");
  }
  const result = await BillingServices.handleStripeWebhook(
    req.rawBody,
    req.header("stripe-signature"),
  );
  res.status(httpStatus.OK).json(result);
});

export const BillingControllers = {
  createCreditCheckout,
  getWallet,
  createMentorSubscriptionCheckout,
  createMentorBillingPortal,
  createMentorConnectOnboarding,
  getMentorBillingStatus,
  webhook,
};
