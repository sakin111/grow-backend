import AppError from "../errorHelper/AppError";
import ejs from "ejs"
import path from "path"
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

export const sendEmail = async ({ to, subject, templateName, templateData, attachments }: IsendEmail) => {
    const templatePath = path.join(__dirname, `templates/${templateName}.ejs`)
    const html = await ejs.renderFile(templatePath, templateData)

    let response: Response
    try {
        response = await fetch(`${process.env.MAIL_API_URL}/api/send-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-mail-secret": process.env.MAIL_API_SECRET!,
            },
            body: JSON.stringify({ to, subject, html }),
            signal: AbortSignal.timeout(15000),
        })
    } catch {
        logger.error("Email API request failed")
        throw new AppError(502, "Email error")
    }

    if (!response.ok) {
        logger.error({ status: response.status }, "Email API returned an unsuccessful response")
        throw new AppError(502, "Email error")
    }

    logger.info({ to, subject }, "Email sent successfully")
}
