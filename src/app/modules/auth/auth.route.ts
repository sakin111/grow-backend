import { NextFunction, Request, Response, Router } from "express";
import { authController } from "./auth.controller";
import passport from "passport";
import { envVar } from "../../config/envVar";

const router = Router()

router.post("/login", authController.login )

router.get("/google", (req: Request, res: Response, next: NextFunction) => {
     const redirect = req.query.redirect as string || "/"
    passport.authenticate("google", { scope: ["email", "profile"], state: redirect })(req, res, next)
})

router.get("/google/callback", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", (err: any, user: any, info: any) => {
        if (err) {
            console.error("Google auth callback error:", err)
            return res.redirect(`${envVar.FRONTEND_URL}/login?error=${encodeURIComponent("Google authentication error")}`)
        }

        if (!user) {
            console.error("Google auth callback failed:", info)
            const message = typeof info?.message === "string" ? info.message : "Google authentication failed"
            return res.redirect(`${envVar.FRONTEND_URL}/login?error=${encodeURIComponent(message)}`)
        }

        req.logIn(user, (loginErr: any) => {
            if (loginErr) {
                console.error("Google login session error:", loginErr)
                return res.redirect(`${envVar.FRONTEND_URL}/login?error=${encodeURIComponent("Login session error")}`)
            }
            authController.GoogleLogin(req, res, next)
        })
    })(req, res, next)
})

export const authRouter = router