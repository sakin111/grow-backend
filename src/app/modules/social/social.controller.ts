import { Request, Response } from "express";
import { SocialService } from "./social.service";

import httpStatus from "http-status";
import CatchAsync from "../../shared/CatchAsync";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../errorHelper/AppError";

const createPost = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
    const payload: any = { ...req.body }

  if (req.file) {
    const file: any = req.file
    const url = file.path || file.secure_url || file.location || file.url
    if (url) payload.image = url
  }
  const result = await SocialService.createPost(userId, payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Post created successfully",
    data: result,
  });
});

const getPostById = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any).id as string
  const result = await SocialService.getPostById(req.params.id as string, userId);

   if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found')
  }
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

   const filters = {
    ...req.query,
    page: Number(req.query.page) || 1,     
    limit: Number(req.query.limit) || 10,   
  }
  const { data, meta } = await SocialService.getSocialFeed(userId, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Social feed retrieved successfully",
    data,
    meta,
  });
});

const searchPosts = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { data, meta } = await SocialService.searchPosts(userId, req.query as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Posts retrieved successfully",
    data,
    meta,
  });
});

const createComment = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await SocialService.createComment(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment created successfully",
    data: result,
  });
});


const getComments = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { data, meta } = await SocialService.getComments(userId, req.params.postId as string, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comments retrieved successfully",
    data,
    meta,
  });
});

const getReplies = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { data, meta } = await SocialService.getReplies(userId, req.params.commentId as string, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Replies retrieved successfully",
    data,
    meta,
  });
});

const updateComment = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await SocialService.updateComment(userId, req.params.id as string, req.body.content);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment updated successfully",
    data: result,
  });
});

const deleteComment = CatchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await SocialService.deleteComment(userId, req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment deleted successfully",
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
  searchPosts,
  createComment,
  getComments,     
  getReplies,       
  updateComment,    
  deleteComment,    
};
