import { Request, Response } from "express";
import CatchAsync from "../../shared/CatchAsync";
import { sendResponse } from "../../shared/sendResponse";
import httpStatus from "http-status";
import { AdminServices } from "./admin.service";
import { VerificationStatus } from "@prisma/client";
import { IJwtPayload } from "../review/review.interface";

const getAllUsers = CatchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllUsers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateUserStatus = CatchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params as any;
  const { status } = req.body;
  const result = await AdminServices.updateUserStatus(userId, status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User status updated successfully",
    data: result,
  });
});

const getAllCompanies = CatchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllCompanies(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Companies retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const reviewVerification = CatchAsync(async (req: Request, res: Response) => {
  const { requestId } = req.params as any;
  const { status, adminNote } = req.body;
  const adminId = (req.user as IJwtPayload)?.id;
  const result = await AdminServices.reviewVerification(requestId, adminId, { status, adminNote });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Company verification status updated successfully",
    data: result,
  });
});

export const AdminControllers = {
  getAllUsers,
  updateUserStatus,
  getAllCompanies,
  reviewVerification,
};
