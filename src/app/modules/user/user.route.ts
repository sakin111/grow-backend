import { Router } from "express";
import { UserControllers } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@prisma/client";


const router = Router()

router.post("/createUser", UserControllers.createUser)
router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe)
router.patch("/me", checkAuth(...Object.values(Role)), UserControllers.updateMe)
router.patch("/role", checkAuth(...Object.values(Role)), UserControllers.updateRole)

export const userRouter = router