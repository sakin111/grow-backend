/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVar } from "../config/envVar";
import { TErrorSources } from "../Interface/error.interface";
import AppError from "../errorHelper/AppError";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logger } from "../lib/logger";



export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    if (envVar.NODE_ENV === "development") {
        logger.error({ err }, "Unhandled error");
    }

    let errorSources: TErrorSources[] = []
    let statusCode = 500
    let message = "Something Went Wrong!!"

    // ── Zod validation errors (thrown by validateRequest middleware) ──
    if (err instanceof ZodError) {
        statusCode = 422
        message = "Validation failed"
        errorSources = err.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
        }))
    }
    // ── Prisma known request errors ──
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002": // unique constraint violation
                statusCode = 409
                message = "Resource already exists"
                errorSources = [{
                    path: (err.meta?.target as string[])?.join(", ") || "unknown",
                    message: `Duplicate value on field(s): ${(err.meta?.target as string[])?.join(", ") || "unknown"}`,
                }]
                break
            case "P2025": // record not found
                statusCode = 404
                message = "Resource not found"
                errorSources = [{
                    path: "",
                    message: err.meta?.cause as string || "The requested record was not found",
                }]
                break
            default:
                statusCode = 400
                message = "Database request error"
                errorSources = [{
                    path: "",
                    message: err.message,
                }]
        }
    }
    // ── Prisma validation errors (bad input types, missing fields, etc.) ──
    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 422
        message = "Database validation error"
        errorSources = [{
            path: "",
            message: "Invalid data provided to the database query",
        }]
    }
    // ── Application errors (our custom AppError) ──
    else if (err instanceof AppError) {
        statusCode = err.statusCode
        message = err.message
    }
    // ── Generic errors ──
    else if (err instanceof Error) {
        statusCode = 500;
        message = err.message
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: envVar.NODE_ENV === "development" ? err : null,
        stack: envVar.NODE_ENV === "development" ? err.stack : null
    })
}
