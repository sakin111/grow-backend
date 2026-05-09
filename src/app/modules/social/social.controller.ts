import { Request, Response } from "express";
import { SocialService } from "./social.service";

import httpStatus from "http-status";
import CatchAsync from "../../shared/CatchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createPost = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await SocialService.createPost(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Post created successfully",
    data: result,
  });
});

const getPostById = CatchAsync(async (req: Request, res: Response) => {
  const result = await SocialService.getPostById(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post retrieved successfully",
    data: result,
  });
});

const updatePost = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await SocialService.updatePost(userId, req.params.id as string, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post updated successfully",
    data: result,
  });
});

const deletePost = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await SocialService.deletePost(userId, req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post deleted successfully",
    data: result,
  });
});

const toggleLike = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await SocialService.toggleLike(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.liked ? "Liked successfully" : "Unliked successfully",
    data: result,
  });
});

const followCompany = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await SocialService.followCompany(userId, req.body.followingId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.followed ? "Followed successfully" : "Unfollowed successfully",
    data: result,
  });
});

const getSocialFeed = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await SocialService.getSocialFeed(userId, req.query as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Social feed retrieved successfully",
    data: result,
  });
});

export const SocialController = {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  followCompany,
  getSocialFeed,
};
