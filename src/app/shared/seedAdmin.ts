import bcryptjs from "bcryptjs";
import { envVar } from "../config/envVar";
import { prisma } from "../lib/prisma";
import { Provider, Role, User, UserStatus } from "@prisma/client";
import { logger } from "../lib/logger";


interface IAuthProvider {
            provider: Provider
            providerId: string;
}


export const seedAdmin = async () => {
    try {
        const isSuperAdminExist = await prisma.user.findUnique({ where: { email: envVar.SUPER_ADMIN } })

        if (isSuperAdminExist) {
            logger.info("Super Admin Already Exists!");
            return;
        }

        logger.info("Trying to create Super Admin...");

        const hashedPassword = await bcryptjs.hash(envVar.SUPER_ADMIN_PASSWORD, Number(envVar.BCRYPT_SALT_ROUND))

        const superAdmin = await prisma.user.create({
            data: {
                name: "Super admin",
                role: Role.ADMIN,
                email: envVar.SUPER_ADMIN,
                password: hashedPassword,
                status: UserStatus.ACTIVE,
                auths: {
                    create: [{
                        provider: Provider.CREDENTIALS,
                        providerId: envVar.SUPER_ADMIN
                    }]
                }
            }
        });
        logger.info({ adminId: superAdmin.id }, "Super Admin Created Successfully!");
    } catch (error) {
        logger.error({ err: error }, "Failed to seed Super Admin");
    }
}