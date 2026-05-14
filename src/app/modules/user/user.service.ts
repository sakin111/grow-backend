import { Provider } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import { envVar } from "../../config/envVar";
import { IAuthProvider } from "./user.interface";
import { sendEmail } from "../../utils/sendEmail";

const createUser = async (payload: any) => {
    const { email, password, ...rest } = payload;

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
        }
    })

    const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code or use UUID
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
        data: {
            email: user.email,
            token,
            expires,
        }
    });

    const verifyLink = `${envVar.FRONTEND_URL}/verify-email?token=${token}&email=${user.email}`;

    await sendEmail({
        to: user.email,
        subject: "Verify your email",
        templateName: "VerifyEmail",
        templateData: {
            name: user.name,
            verifyLink,
        }
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
    updateRole
}