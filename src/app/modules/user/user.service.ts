import { Provider } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import { envVar } from "../../config/envVar";
import { CreateUserPayload, IAuthProvider } from "./user.interface";
import { sendVerificationEmail } from "../../utils/verificationEmail";
import { logger } from "../../lib/logger";

const createUser = async (payload: CreateUserPayload) => {
    const { email, password, confirmPassword, ...rest } = payload;

    if (password !== confirmPassword) {
        throw new AppError(httpStatus.BAD_REQUEST, "Password and confirm password do not match")
    }

    const isUserExist = await prisma.user.findUnique({ where: { email } })

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist")
    }

    const hashedPassword = await bcrypt.hash(password as string, Number(envVar.BCRYPT_SALT_ROUND))

    const authProvider: IAuthProvider = { provider: Provider.CREDENTIALS, providerId: email as string }


    const user = await prisma.user.create({
        data: {
            email: email,
            password: hashedPassword,
            auths: {
                create: [authProvider]
            },
            ...rest
        },
        select: {
            id: true, name: true, email: true,
            role: true, createdAt: true,
        }
    })

    void sendVerificationEmail(user.email, user.name).catch((error: unknown) => {
        logger.warn({ err: error }, "Verification email could not be sent; user account was created");
    });

    return user

}



const getMe = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            mentorProfile: true,
            company: true
        }
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return user;
};



const updateMe = async (userId: string, payload: any) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: payload
    });

    return user;
};

const deleteMe = async (userId: string) => {
    await prisma.user.update({
        where: { id: userId },
        data: {
            isDeleted: true,
            isActive: false
        }
    });
};


const updateRole = async (userId: string, role: any) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: { role }
    });

    return user;
};


export const UserServices = {
    createUser,
    getMe,
    updateMe,
    deleteMe,
    updateRole
}