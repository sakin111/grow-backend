
import { NotificationType } from "@prisma/client";
import { NotificationServices } from "./notification.service";
import { emitToUser } from "../../lib/socket";
import { logger } from "../../lib/logger";

export const sendInAppNotification = async (payload: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}) => {
  try {
    const notification = await NotificationServices.createNotification(payload);
    emitToUser(payload.userId, "notification", notification);
    return notification;
  } catch (error) {
    logger.error({ err: error, userId: payload.userId, type: payload.type }, "Error sending notification");
  }
};
