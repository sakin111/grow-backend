
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../errorHelper/AppError";
import { verifyToken } from "../shared/jwt";
import { prisma } from "../lib/prisma";
import { UserStatus } from "@prisma/client";
import { envVar } from "../config/envVar";
import { JwtPayload } from "jsonwebtoken";
import { logger } from "../lib/logger";



export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {

    try {
        const accessToken = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

        if (!accessToken) {
            throw new AppError(403, "No Token Recieved")
        }


        const verifiedToken = verifyToken(accessToken, envVar.JWT_ACCESS_SECRET) as JwtPayload

        const isUserExist = await prisma.user.findUnique({ where: { email: verifiedToken.email } })

        if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
        }

        if (isUserExist.status === UserStatus.BANNED || isUserExist.status === UserStatus.SUSPENDED) {
            throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.status}`)
        }
        if (isUserExist.isDeleted) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
        }

        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(403, "You are not permitted to view this route!!!")
        }
        req.user = verifiedToken
        next()

    } catch (error) {
        logger.warn({ err: error }, "JWT authentication error");
        next(error)
    }
}