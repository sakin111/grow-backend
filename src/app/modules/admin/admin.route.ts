import { Router } from "express";
import { AdminControllers } from "./admin.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@prisma/client";
import { validateRequest } from "../../middleware/validateRequest";
import { AdminValidation } from "./admin.validation";


const router = Router();

router.get(
  "/users",
  checkAuth(Role.ADMIN),
  AdminControllers.getAllUsers
);

router.get(
  "/companies",
  checkAuth(Role.ADMIN),
  AdminControllers.getAllCompanies
);

router.patch(
  "/verification/:id/review",
  checkAuth(Role.ADMIN),
  validateRequest(AdminValidation.reviewVerificationSchema),
 AdminControllers.reviewVerification
);

router.patch(
  "/users/:userId/status",
  checkAuth(Role.ADMIN),
  validateRequest(AdminValidation.updateUserStatusValidationSchema),
  AdminControllers.updateUserStatus
);
export const adminRouter = router;
