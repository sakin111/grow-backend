import { Router } from "express";
import { CompanyControllers } from "./company.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@prisma/client";


const router = Router()

router.post("/company", checkAuth(Role.OWNER,Role.ADMIN,Role.MENTOR), CompanyControllers.createCompany)
router.get("/company", checkAuth(Role.ADMIN), CompanyControllers.getAllCompanies)
router.get("/company/:id", checkAuth(Role.ADMIN,Role.OWNER,Role.MENTOR), CompanyControllers.getSingleCompany)
router.patch("/company/:id", checkAuth(Role.OWNER,Role.ADMIN,Role.MENTOR), CompanyControllers.updateCompany)
router.delete("/company/:id", checkAuth(Role.OWNER,Role.ADMIN,Role.MENTOR), CompanyControllers.deleteCompany)

export const companyRouter = router