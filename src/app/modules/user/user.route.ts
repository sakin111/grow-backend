import { Router } from "express";
import { UserControllers } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@prisma/client";
import { validate } from "../../error/validation";
import { UserValidation } from "./user.validation";


const router = Router()

router.post("/createUser", validate(UserValidation.createUserSchema), UserControllers.createUser)
router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe)
router.patch("/me", checkAuth(...Object.values(Role)), UserControllers.updateMe)
router.patch("/role", checkAuth(...Object.values(Role)), UserControllers.updateRole)

export const userRouter = router