import { NextFunction, Request, Response } from "express"
import CatchAsync from "../../shared/CatchAsync"
import { sendResponse } from "../../shared/sendResponse"
import httpStatus from "http-status";
import { DiscussionServices } from "./discussion.service";
import { IJwtPayload } from "./discussion.interface";


const createDiscussion = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IJwtPayload)?.id;
    const discussion = await DiscussionServices.createDiscussion(userId, req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Discussion Created Successfully",
        data: discussion,
    })
})

const getAllDiscussions = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { companyId } = req.query;
    const discussions = await DiscussionServices.getAllDiscussions(companyId as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Discussions Retrieved Successfully",
        data: discussions,
    })
})

const getSingleDiscussion = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const discussion = await DiscussionServices.getSingleDiscussion(id as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Discussion Retrieved Successfully",
        data: discussion,
    })
})

const updateDiscussion = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = (req.user as IJwtPayload)?.id;
    const discussion = await DiscussionServices.updateDiscussion(id as string, userId, req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Discussion Updated Successfully",
        data: discussion,
    })
})

const deleteDiscussion = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = (req.user as IJwtPayload)?.id;
    const discussion = await DiscussionServices.deleteDiscussion(id as string, userId)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Discussion Deleted Successfully",
        data: discussion,
    })
})

const getDiscussionsByTopic = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { topic } = req.params;
    const discussions = await DiscussionServices.getDiscussionsByTopic(topic as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Discussions Retrieved Successfully",
        data: discussions,
    })
})


export const DiscussionControllers = {
    createDiscussion,
    getAllDiscussions,
    getSingleDiscussion,
    updateDiscussion,
    deleteDiscussion,
    getDiscussionsByTopic,
}