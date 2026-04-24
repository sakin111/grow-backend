import { NextFunction, Request, Response, Router } from "express";
import { authController } from "./auth.controller";
import passport from "passport";
import { envVar } from "../../config/envVar";

const router = Router()

router.post("/login", authController.login)

router.get("/google", (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect as string || "/"
    passport.authenticate("google", { scope: ["email", "profile"], state: redirect })(req, res, next)
})

router.get("/google/callback", passport.authenticate("google", { failureRedirect: `${envVar.FRONTEND_URL}/login?error=There is some issues with your account. Please contact with out support team!` }), authController.GoogleLogin)


export const authRouter = router