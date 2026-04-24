import { Router } from "express";
import { AdminControllers } from "./admin.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@prisma/client";
import { validateRequest } from "../../middleware/validateRequest";
import { AdminValidations } from "./admin.validation";

const router = Router();

router.get(
  "/users",
  checkAuth(Role.ADMIN),
  AdminControllers.getAllUsers
);

router.patch(
  "/users/:userId/status",
  checkAuth(Role.ADMIN),
  validateRequest(AdminValidations.updateUserStatusValidationSchema),
  AdminControllers.updateUserStatus
);

router.get(
  "/companies",
  checkAuth(Role.ADMIN),
  AdminControllers.getAllCompanies
);

router.patch(
  "/companies/:companyId/verify",
  checkAuth(Role.ADMIN),
  validateRequest(AdminValidations.verifyCompanyValidationSchema),
  AdminControllers.verifyCompany
);

export const adminRouter = router;
