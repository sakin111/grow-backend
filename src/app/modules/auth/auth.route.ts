import { NextFunction, Request, Response, Router } from "express";
import { authController } from "./auth.controller";
import passport from "passport";
import { envVar } from "../../config/envVar";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@prisma/client";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthValidation } from "./auth.validation";


const router = Router()

router.post("/login", authController.login)
router.post("/logout", authController.logout)
router.post("/refresh-token", authController.getAccessToken)
router.post("/change-password", checkAuth(...Object.values(Role)), authController.changePassword)
router.post("/set-password", checkAuth(...Object.values(Role)), authController.setPassword)
router.post("/forgot-password", validateRequest(AuthValidation.forgotPasswordValidationSchema), authController.forgotPassword)
router.post("/reset-password", validateRequest(AuthValidation.resetPasswordValidationSchema), authController.resetPassword)

router.get("/google", (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect as string || "/"
    passport.authenticate("google", { scope: ["email", "profile"], state: redirect })(req, res, next)
})

router.get("/google/callback", passport.authenticate("google", { failureRedirect: `${envVar.FRONTEND_URL}/login?error=There is some issues with your account. Please contact with out support team!` }), authController.GoogleLogin)


export const authRouter = router