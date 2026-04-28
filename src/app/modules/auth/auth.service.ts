import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs"
import { envVar } from "../../config/envVar";
import { UserStatus } from "@prisma/client";
import jwt from "jsonwebtoken"
import { sendEmail } from "../../utils/sendEmail";
import bcryptjs from "bcryptjs"


const changePassword = async (decodedToken: JwtPayload, currentPassword: string, newPassword: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: decodedToken.id
        }
    })
    const isOldPasswordMatch = await bcrypt.compare(currentPassword, user!.password as string)
    if (!isOldPasswordMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match");
    }
    user!.password = await bcrypt.hash(newPassword, envVar.BCRYPT_SALT_ROUND)
    await prisma.user.update({
        where: {
            id: decodedToken.id
        },
        data: {
            password: user!.password
        }
    })

    return null;

};
const forgotPassword = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })


    if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
    }
    if (!user.emailVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
    }
    if (user.status === UserStatus.BANNED || user.status === UserStatus.SUSPENDED) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${user.status}`)
    }
    if (user.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
    }

    if (!user!.password) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You can't reset password as you haven't set it yet");
    }

    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
    }
    const resetToken = jwt.sign(jwtPayload, envVar.JWT_ACCESS_SECRET, {
        expiresIn: "10m"
    })
    const emailLink = `${envVar.FRONTEND_URL}/reset-password?id=${user.id}&token=${resetToken}`

    await sendEmail({
        to: user.email,
        subject: "Reset your password",
        templateName: "ForgotPassword",
        templateData: {
            name: user.name,
            resetUILink: emailLink
        }
    })
    return {
        message: "Password reset email sent successfully"
    }

};

const setPassword = async (decodedToken: JwtPayload, password: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: decodedToken.id
        },
        include: {
            auths: true
        }
    })

    if (!user) {
        throw new AppError(404, "User not found");
    }

    if (user.password && user.auths.some(providerObject => providerObject.provider === "GOOGLE")) {
        throw new AppError(httpStatus.BAD_REQUEST, "You have already set you password. Now you can change the password from your profile password update")
    }

    if (user!.password) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Password already set");
    }
    user!.password = await bcrypt.hash(password, envVar.BCRYPT_SALT_ROUND)
    await prisma.user.update({
        where: {
            id: decodedToken.id
        },
        data: {
            password: user!.password
        }
    })

    return null;

};


const resetPassword = async (payload: Record<string, any>, decodedToken: JwtPayload) => {
    if (payload.id != decodedToken.userId) {
        throw new AppError(401, "You can not reset your password")
    }

    const isUserExist = await prisma.user.findUnique({
        where: {
            id: decodedToken.id
        }
    })
    if (!isUserExist) {
        throw new AppError(401, "User does not exist")
    }

    const hashedPassword = await bcryptjs.hash(
        payload.newPassword,
        Number(envVar.BCRYPT_SALT_ROUND)
    )

    await prisma.user.update({
        where: {
            id: decodedToken.userId
        },
        data: {
            password: hashedPassword
        }
    })
    return null;
}

export const AuthServices = {
    changePassword,
    setPassword,
    forgotPassword,
    resetPassword
};
