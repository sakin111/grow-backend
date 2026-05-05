import { NextFunction, Request, Response } from "express";
import CatchAsync from "../../shared/CatchAsync";
import { sendResponse } from "../../shared/sendResponse";
import httpStatus from "http-status";
import { ReviewServices } from "./review.service";
import { IJwtPayload } from "./review.interface";

const createReview = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = (req.user as IJwtPayload)?.id;
    const review = await ReviewServices.createReview(ownerId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Review Created Successfully",
      data: review,
    });
  }
);

const getReviewsByMentor = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { mentorId } = req.params;
    const result = await ReviewServices.getReviewsByMentor(
      mentorId as string,
      req.query
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Reviews Retrieved Successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getMyReviews = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = (req.user as IJwtPayload)?.id;
    const result = await ReviewServices.getMyReviews(ownerId, req.query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "My Reviews Retrieved Successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const updateReview = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = (req.user as IJwtPayload)?.id;
    const { reviewId } = req.params;
    const review = await ReviewServices.updateReview(
      ownerId,
      reviewId as string,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Review Updated Successfully",
      data: review,
    });
  }
);

const deleteReview = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = (req.user as IJwtPayload)?.id;
    const { reviewId } = req.params;
    const review = await ReviewServices.deleteReview(
      ownerId,
      reviewId as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Review Deleted Successfully",
      data: review,
    });
  }
);

export const ReviewControllers = {
  createReview,
  getReviewsByMentor,
  getMyReviews,
  updateReview,
  deleteReview,
};
