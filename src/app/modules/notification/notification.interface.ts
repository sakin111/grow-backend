
import { NotificationType } from "@prisma/client";

export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

export interface IJwtPayload {
  id: string;
  email: string;
  role: string;
  name?: string;
}
