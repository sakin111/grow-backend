import AppError from "../errorHelper/AppError";
import ejs from "ejs"
import path from "path"
import { Resend } from "resend"
import { envVar } from "../config/envVar";
import { logger } from "../lib/logger";


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

const resend = new Resend(envVar.RESEND_API_KEY)


export const sendEmail = async ({ to, subject, templateName, templateData, attachments }: IsendEmail) => {
    const templatePath = path.join(__dirname, `templates/${templateName}.ejs`)
    const html = await ejs.renderFile(templatePath, templateData)
    const { data, error } = await resend.emails.send({
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

    if (error) {
        logger.error({ err: error, to, subject }, "Email sending error");
        throw new AppError(500, "Email error")
    }

    logger.info({ to, subject, messageId: data?.id }, "Email sent successfully");
}