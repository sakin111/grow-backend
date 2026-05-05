
import { Router } from "express";
import { NotificationControllers } from "./notification.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/",
  checkAuth(...Object.values(Role)),
  NotificationControllers.getMyNotifications
);

router.patch(
  "/mark-all-read",
  checkAuth(...Object.values(Role)),
  NotificationControllers.markAllAsRead
);

router.patch(
  "/:id/read",
  checkAuth(...Object.values(Role)),
  NotificationControllers.markAsRead
);

export const notificationRouter = router;
