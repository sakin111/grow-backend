import crypto from "crypto"
import { prisma } from "../lib/prisma"
import { envVar } from "../config/envVar"
import { sendEmail } from "./sendEmail"

export const sendVerificationEmail = async (email: string, name: string) => {
    await prisma.verificationToken.deleteMany({
        where: { email }
    })

    const token = crypto.randomInt(100000, 999999).toString()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.verificationToken.create({
        data: {
            email,
            token,
            expires,
        }
    })

    const verifyLink = `${envVar.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`

    await sendEmail({
        to: email,
        subject: "Verify your email",
        templateName: "VerifyEmail",
        templateData: {
            name,
            verifyLink,
        }
    })
}
