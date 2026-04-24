import { Request, Response } from "express";
import CatchAsync from "../../shared/CatchAsync";
import { sendResponse } from "../../shared/sendResponse";
import httpStatus from "http-status";
import { AdminServices } from "./admin.service";
import { VerificationStatus } from "@prisma/client";

const getAllUsers = CatchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const result = await AdminServices.getAllUsers(page, limit);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateUserStatus = CatchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
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
  const status = req.query.status as VerificationStatus;
  const result = await AdminServices.getAllCompanies(status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Companies retrieved successfully",
    data: result,
  });
});

const verifyCompany = CatchAsync(async (req: Request, res: Response) => {
  const { companyId } = req.params;
  const { status } = req.body;
  const result = await AdminServices.verifyCompany(companyId, status);

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
  verifyCompany,
};
