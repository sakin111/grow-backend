import { Response } from "express";
import { envVar } from "../config/envVar";

export interface AuthTokens {
    accessToken?: string;
    refreshToken?: string;
}

const cookieOptions = {
    httpOnly: true,
    sameSite: "none" as const,
    secure: envVar.NODE_ENV === "production",
    path: "/",
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 60 * 24,
        })
    }

    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 60 * 24 * 90,
        })
    }
}