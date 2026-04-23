import { z } from "zod";
import { Topic } from "@prisma/client";

const createDiscussionValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
    content: z.string().min(1, "Content is required").max(5000, "Content must be less than 5000 characters"),
    topic: z.nativeEnum(Topic, { message: "Topic is required" }),
    companyId: z.string().uuid("Invalid company ID"),
    isPublic: z.boolean().optional(),
  }),
});

const updateDiscussionValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").optional(),
    content: z.string().min(1, "Content is required").max(5000, "Content must be less than 5000 characters").optional(),
    topic: z.nativeEnum(Topic).optional(),
    isPublic: z.boolean().optional(),
  }),
});

export const DiscussionValidations = {
  createDiscussionValidationSchema,
  updateDiscussionValidationSchema,
};