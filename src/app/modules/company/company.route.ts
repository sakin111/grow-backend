import { Router } from "express";
import { CompanyControllers } from "./company.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@prisma/client";
import { validate } from "../../error/validation";
import { CompanyValidation } from "./company.validation";


const router = Router()

router.post(
  "/createCompany",
  checkAuth(Role.OWNER, Role.ADMIN, Role.MENTOR),
  CompanyControllers.createCompany
)
router.get("/getAllCompanies", checkAuth(Role.ADMIN), validate(CompanyValidation.createCompanySchema), CompanyControllers.getAllCompanies)


router.post(
  "/company/:id/request",
  checkAuth(Role.OWNER),
  validate(CompanyValidation.requestVerificationSchema),
  CompanyControllers.requestVerification
);

router.get("/getSingleCompany/:id", checkAuth(Role.ADMIN,Role.OWNER,Role.MENTOR), CompanyControllers.getSingleCompany)
router.patch("/updateCompany/:id", checkAuth(Role.OWNER,Role.ADMIN,Role.MENTOR), validate(CompanyValidation.updateCompanySchema), CompanyControllers.updateCompany)
router.delete("/deleteCompany/:id", checkAuth(Role.OWNER,Role.ADMIN,Role.MENTOR), CompanyControllers.deleteCompany)

export const companyRouter = router