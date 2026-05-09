import { z } from "zod";
import { Topic } from "@prisma/client";

const createPost = z.object({
  body: z.object({
    content: z.string({ error: "Content is required" }),
    image: z.string().optional(),
    topic: z.nativeEnum(Topic, { error: "Topic is required" }),
  }),
});

const updatePost = z.object({
  body: z.object({
    content: z.string().optional(),
    image: z.string().optional(),
    topic: z.nativeEnum(Topic).optional(),
  }),
});

const toggleLike = z.object({
  body: z.object({
    postId: z.string().optional(),
    discussionId: z.string().optional(),
  }).refine(data => data.postId || data.discussionId, {
    message: "Either postId or discussionId must be provided"
  }),
});

const followCompany = z.object({
  body: z.object({
    followingId: z.string({ error: "Following company ID is required" }),
  }),
});

export const SocialValidation = {
  createPost,
  updatePost,
  toggleLike,
  followCompany,
};
