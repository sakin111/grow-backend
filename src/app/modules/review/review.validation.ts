import { z } from "zod";

const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid("Invalid booking ID"),
    rating: z
      .number()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
    comment: z.string().min(5, "Comment must be at least 5 characters"),
  }),
});

const updateReviewSchema = z.object({
  body: z.object({
    rating: z
      .number()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5")
      .optional(),
    comment: z
      .string()
      .min(5, "Comment must be at least 5 characters")
      .optional(),
  }),
});

export const ReviewValidation = {
  createReviewSchema,
  updateReviewSchema,
};
