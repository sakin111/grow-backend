import { NextFunction, Request, Response } from "express"
import CatchAsync from "../../shared/CatchAsync"
import passport from "passport"
import AppError from "../../errorHelper/AppError"
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../shared/userToken"
import { sendResponse } from "../../shared/sendResponse"
import httpStatus from "http-status"
import { setAuthCookie } from "../../shared/setCookie"
import { envVar } from "../../config/envVar"
import { AuthServices } from "./auth.service"
import { JwtPayload } from "jsonwebtoken"




const login = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {

    passport.authenticate("local", async (err: any, user: any, info: any) => {

        if (err) {
            return next(new AppError(401, err))
        }
        if (!user) {
            return next(new AppError(401, info.message))
        }

        const userToken = await createUserTokens(user)

        const { password: pass, ...rest } = user

        setAuthCookie(res, userToken)

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Login successful",
            data: {
                user: rest
            }
        })

    })(req, res, next)

})


const GoogleLogin = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {


    let redirectTo = req.query.state ? req.query.state as string : ""

    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1)
    }
    const user = req.user as any;


    if (!user) {
        return next(new AppError(401, "Authentication failed"))
    }

    const userToken = await createUserTokens(user)

    const { password: pass, ...rest } = user

    setAuthCookie(res, userToken)

    const redirectUrl = `${envVar.FRONTEND_URL}/${redirectTo}`
    console.log("Google login redirect to:", redirectUrl)
    res.redirect(redirectUrl)
})




const getAccessToken = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return next(new AppError(httpStatus.BAD_REQUEST, "Refresh token is required"))
    }
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "New access token generated",
        data: {
            accessToken: newAccessToken
        }
    })
})

const setPassword = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const decodedToken = req.user as JwtPayload
    const { password } = req.body

    await AuthServices.setPassword(decodedToken, password)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password set successfully",
        data: null
    })
})
const changePassword = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const { newPassword, currentPassword } = req.body
    const decodedToken = req.user as JwtPayload

    await AuthServices.changePassword(decodedToken, currentPassword, newPassword)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password changed successfully",
        data: null
    })
})

const forgotPassword = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {


    const { email } = req.body;

    await AuthServices.forgotPassword(email);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Email Sent Successfully",
        data: null,
    })
})

const resetPassword = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {

    await AuthServices.resetPassword(req.body, req.user as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password Changed Successfully",
        data: null,
    })
})

const logout = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    })

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User Logged Out successful",
        data: null
    })
})



const verifyEmail = CatchAsync(async (req: Request, res: Response) => {
    const { email, token } = req.query;

    const result = await AuthServices.verifyEmail(email as string, token as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null
    });
});

export const authController = {
    login,
    GoogleLogin,
    getAccessToken,
    logout,
    changePassword,
    setPassword,
    forgotPassword,
    resetPassword,
    verifyEmail
};
