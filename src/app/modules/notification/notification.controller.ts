
import { Request, Response } from "express";
import CatchAsync from "../../shared/CatchAsync";
import { sendResponse } from "../../shared/sendResponse";
import httpStatus from "http-status";
import { NotificationServices } from "./notification.service";
import { IJwtPayload } from "./notification.interface";

const getMyNotifications = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as IJwtPayload).id;
  const result = await NotificationServices.getMyNotifications(userId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Notifications retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const markAsRead = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as IJwtPayload).id;
  const { id } = req.params;
  const result = await NotificationServices.markAsRead(id as string, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Notification marked as read",
    data: result,
  });
});

const markAllAsRead = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as IJwtPayload).id;
  const result = await NotificationServices.markAllAsRead(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All notifications marked as read",
    data: result,
  });
});

export const NotificationControllers = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
