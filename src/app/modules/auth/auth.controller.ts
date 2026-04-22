import { NextFunction, Request, Response } from "express"
import CatchAsync from "../../shared/CatchAsync"
import passport from "passport"
import AppError from "../../errorHelper/AppError"
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../shared/userToken"
import { sendResponse } from "../../shared/sendResponse"
import httpStatus from "http-status"
import { setAuthCookie } from "../../shared/setCookie"
import { envVar } from "../../config/envVar"




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

    const user = req.user as any;

    if (!user) {
        return next(new AppError(401, "Authentication failed"))
    }

    const userToken = await createUserTokens(user)

    const { password: pass, ...rest } = user

    setAuthCookie(res, userToken)

    res.redirect(envVar.FRONTEND_URL)

/**
 * todo: set the frontend url in env variable and redirect to that url with access token and refresh token in cookie
 */

})




const getAccessToken = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return new AppError(httpStatus.BAD_REQUEST, "Refresh token is required")
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



export const authController = {
    login,
    GoogleLogin,
    getAccessToken,
    logout
}