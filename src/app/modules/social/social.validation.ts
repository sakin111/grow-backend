import { z } from "zod";
import { Topic } from "@prisma/client";
import { envVar } from "../../config/envVar";

const createPost = z.object({
  body: z.object({
    content: z.string({ error: "Content is required" }),
    companyId: z.string().min(1, "Company ID is required"),
    image: z
      .string()
      .url("Image must be a valid URL")
      .refine(
        (url) =>
          url.startsWith(
            `https://res.cloudinary.com/${envVar.CLOUDINARY_CLOUD_NAME}/`
          ),
        "Image URL must be hosted in this Cloudinary account"
      )
      .optional(),
    topic: z.enum(Topic).optional(),
  }),
});

const updatePost = z.object({
  body: z.object({
    content: z.string().optional(),
    image: z.string().optional(),
    topic: z.enum(Topic).optional(),
  }),
});

const toggleLike = z.object({
  body: z.object({
    postId: z.string().optional(),
    discussionId: z.string().optional(),
    commentId: z.string().optional(),
  }).refine(data => data.postId || data.discussionId || data.commentId, {
    message: "Either postId, discussionId or commentId must be provided"
  }),
});

const followCompany = z.object({
  body: z.object({
    followingId: z.string({ error: "Following company ID is required" }),
  }),
});

const createComment = z.object({
  body: z.object({
    content: z.string({ error: "Content is required" }),
    postId: z.string().optional(),
    parentId: z.string().optional(),
  }).refine(data => data.postId || data.parentId, {
    message: "Either postId or parentId must be provided"
  }),
});

const updateComment = z.object({
  body: z.object({
    content: z.string().optional(),
  }),
});

export const SocialValidation = {
  createPost,
  updatePost,
  toggleLike,
  followCompany,
  createComment,
  updateComment,
};
