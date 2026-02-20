import { Provider } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import { envVar } from "../../config/envVar";
import { IAuthProvider } from "./user.interface";



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

    return user

}


export const UserServices = {
    createUser
}