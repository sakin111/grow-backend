
import { prisma } from "../../lib/prisma";
import { ICreateNotificationPayload } from "./notification.interface";
import { QueryBuilder } from "../../shared/QueryBuilder";

const createNotification = async (payload: ICreateNotificationPayload) => {
  const notification = await prisma.notification.create({
    data: payload,
  });

  // Emit socket event for real-time notification
  // This will be handled in the socket logic
  return notification;
};

const getMyNotifications = async (userId: string, query: Record<string, any>) => {
  const notificationQuery = new QueryBuilder(prisma.notification, query)
    .filter()
    .addWhere({ userId })
    .sort("-createdAt")
    .paginate();

  const data = await notificationQuery.build();
  const meta = await notificationQuery.getMeta();

  return {
    meta,
    data,
  };
};

const markAsRead = async (notificationId: string, userId: string) => {
  const notification = await prisma.notification.update({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
  return notification;
};

const markAllAsRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { message: "All notifications marked as read" };
};

export const NotificationServices = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
