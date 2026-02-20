import { NextFunction, Request, Response } from "express";
import CatchAsync from "../../shared/CatchAsync"
import { sendResponse } from "../../shared/sendResponse";
import httpStatus from "http-status";
import { UserServices } from "./user.service";


const createUser = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Created Successfully",
        data: user,
    })
})


export const UserControllers = {
    createUser,

}