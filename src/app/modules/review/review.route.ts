import { Router } from "express";
import { ReviewControllers } from "./review.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewValidation } from "./review.validation";
import { Role } from "@prisma/client";

const router = Router();

// Create a review (only session owner after completion)
router.post(
  "/",
  checkAuth(Role.OWNER),
  validateRequest(ReviewValidation.createReviewSchema),
  ReviewControllers.createReview
);

// Get my reviews (reviews I've written)
router.get(
  "/my",
  checkAuth(Role.OWNER),
  ReviewControllers.getMyReviews
);

// Get reviews for a specific mentor
router.get(
  "/mentor/:mentorId",
  checkAuth(...Object.values(Role)),
  ReviewControllers.getReviewsByMentor
);

// Update a review
router.patch(
  "/:reviewId",
  checkAuth(Role.OWNER),
  validateRequest(ReviewValidation.updateReviewSchema),
  ReviewControllers.updateReview
);

// Delete a review
router.delete(
  "/:reviewId",
  checkAuth(Role.OWNER),
  ReviewControllers.deleteReview
);

export const reviewRouter = router;
