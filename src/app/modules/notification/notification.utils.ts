
import { NotificationType } from "@prisma/client";
import { NotificationServices } from "./notification.service";
import { emitToUser } from "../../lib/socket";

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
    console.error("Error sending notification:", error);
  }
};
