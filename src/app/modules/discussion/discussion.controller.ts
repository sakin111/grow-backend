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

const getAllDiscussions = CatchAsync(async (req: Request, res: Response) => {
  const { companyId, topic } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await DiscussionServices.getAllDiscussions(
    page,
    limit,
    topic as string,
    companyId as string
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Discussions Retrieved Successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleDiscussion = CatchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const discussion = await DiscussionServices.getSingleDiscussion(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Discussion Retrieved Successfully",
    data: discussion,
  });
});

const updateDiscussion = CatchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as IJwtPayload)?.id;
  const discussion = await DiscussionServices.updateDiscussion(
    id as string,
    userId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Discussion Updated Successfully",
    data: discussion,
  });
});

const deleteDiscussion = CatchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as IJwtPayload)?.id;
  const discussion = await DiscussionServices.deleteDiscussion(id as string, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Discussion Deleted Successfully",
    data: discussion,
  });
});

// Comment Controllers
const createComment = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as IJwtPayload)?.id;
  const comment = await DiscussionServices.createComment(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Comment Created Successfully",
    data: comment,
  });
});

const updateComment = CatchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as IJwtPayload)?.id;
  const { content } = req.body;
  const comment = await DiscussionServices.updateComment(id, userId, content);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Comment Updated Successfully",
    data: comment,
  });
});

const deleteComment = CatchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as IJwtPayload)?.id;
  const comment = await DiscussionServices.deleteComment(id, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Comment Deleted Successfully",
    data: comment,
  });
});

export const DiscussionControllers = {
  createDiscussion,
  getAllDiscussions,
  getSingleDiscussion,
  updateDiscussion,
  deleteDiscussion,
  createComment,
  updateComment,
  deleteComment,
};