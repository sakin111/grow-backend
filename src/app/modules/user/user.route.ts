import { Router } from "express";
import { UserControllers } from "./user.controller";


const router = Router()

router.post("/createUser", UserControllers.createUser)

export const userRouter = router