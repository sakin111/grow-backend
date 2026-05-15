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


const getMe = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as any)?.id;
    const user = await UserServices.getMe(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Profile Retrieved Successfully",
        data: user,
    });
});


const updateMe = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as any)?.id;
    const user = await UserServices.updateMe(userId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Profile Updated Successfully",
        data: user,
    });
});


const updateRole = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as any)?.id;
    const { role } = req.body;
    const user = await UserServices.updateRole(userId, role);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Role Updated Successfully",
        data: user,
    });
});


export const UserControllers = {
    createUser,
    getMe,
    updateMe,
    updateRole
}