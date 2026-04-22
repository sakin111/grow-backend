import { NextFunction, Request, Response, Router } from "express";
import { authController } from "./auth.controller";
import passport from "passport";

const router = Router()

router.post("/login", authController.login )

router.get("/google", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", { scope: ["email", "profile"] })(req, res, next)
})
router.get("/google/callback", passport.authenticate("google", {failureRedirect: "/login"}), authController.GoogleLogin)

export const authRouter = router