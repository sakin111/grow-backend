/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVar } from "../config/envVar";
import { TErrorSources } from "../Interface/error.interface";
import AppError from "../errorHelper/AppError";



export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    if (envVar.NODE_ENV === "development") {
        console.log(err);
    }
    // console.log({ file: req.files });
    // if (req.file) {
    //     await deleteImageFromCLoudinary(req.file.path)
    // }

    // if (req.files && Array.isArray(req.files) && req.files.length) {
    //     const imageUrls = (req.files as Express.Multer.File[]).map(file => file.path)

    //     await Promise.all(imageUrls.map(url => deleteImageFromCLoudinary(url)))
    // }

    let errorSources: TErrorSources[] = []
    let statusCode = 500
    let message = "Something Went Wrong!!"

    if (err instanceof AppError) {
        statusCode = err.statusCode
        message = err.message
    } else if (err instanceof Error) {
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
