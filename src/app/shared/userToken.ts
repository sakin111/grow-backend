import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";




import { generateToken, verifyToken } from "./jwt";
import { User, UserStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { envVar } from "../config/envVar";
import AppError from "../errorHelper/AppError";

export const createUserTokens = (user:Partial<User>) => {
    const jwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role
    }
    const accessToken = generateToken(jwtPayload, envVar.JWT_ACCESS_SECRET, envVar.JWT_ACCESS_EXPIRES)

    const refreshToken = generateToken(jwtPayload, envVar.JWT_REFRESH_SECRET, envVar.JWT_REFRESH_EXPIRES)


    return {
        accessToken,
        refreshToken
    }
}

export const createNewAccessTokenWithRefreshToken = async (refreshToken: string) => {

    const verifiedRefreshToken = verifyToken(refreshToken, envVar.JWT_REFRESH_SECRET) as JwtPayload


    const isUserExist = await prisma.user.findUnique({ where: { email: verifiedRefreshToken.email } })

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
    }
    if (isUserExist.status === UserStatus.SUSPENDED || isUserExist.status === UserStatus.BANNED) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.status}`)
    }
    if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
    }

    const jwtPayload = {
        id: isUserExist.id,
        email: isUserExist.email,
        role: isUserExist.role
    }
    const accessToken = generateToken(jwtPayload, envVar.JWT_ACCESS_SECRET, envVar.JWT_ACCESS_EXPIRES)

    return accessToken
}