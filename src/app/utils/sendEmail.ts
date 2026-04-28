import AppError from "../errorHelper/AppError";
import ejs from "ejs"
import path from "path"
import nodemailers from "nodemailer"
import { envVar } from "../config/envVar";


export interface IsendEmail {
    to: string;
    subject: string;
    templateName: string;
    templateData?: Record<string, any>
    attachments?: {
        filename: string;
        content: Buffer | string
        contentType?: string;
    }[]


}

const transporter = nodemailers.createTransport({
    secure: true,
    auth: {
        user: envVar.EMAIL_USER,
        pass: envVar.EMAIL_PASS
    },
    port: envVar.EMAIL_PORT,
    host: envVar.EMAIL_HOST
})


export const sendEmail = async ({ to, subject, templateName, templateData, attachments }: IsendEmail) => {
    try {
        const templatePath = path.join(__dirname, `templates/${templateName}.ejs`)
        const html = await ejs.renderFile(templatePath, templateData)
        const info = await transporter.sendMail({
            from: envVar.EMAIL_FROM,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map(attachment => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType
            }))
        })

        console.log(info);
    } catch (error: any) {
        console.log("email sending error", error.message);
        throw new AppError(401, "Email error")
    }
}