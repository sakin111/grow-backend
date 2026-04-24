import { Router } from "express";
import { DiscussionControllers } from "./discussion.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@prisma/client";
import { validateRequest } from "../../middleware/validateRequest";
import { DiscussionValidations } from "./discussion.validation";

const router = Router();

// Discussion routes
router.post(
  "/discussion",
  checkAuth(Role.OWNER, Role.ADMIN),
  validateRequest(DiscussionValidations.createDiscussionValidationSchema),
  DiscussionControllers.createDiscussion
);
router.get("/discussion", DiscussionControllers.getAllDiscussions);
router.get("/discussion/:id", DiscussionControllers.getSingleDiscussion);
router.patch(
  "/discussion/:id",
  checkAuth(Role.OWNER, Role.ADMIN),
  validateRequest(DiscussionValidations.updateDiscussionValidationSchema),
  DiscussionControllers.updateDiscussion
);
router.delete(
  "/discussion/:id",
  checkAuth(Role.OWNER, Role.ADMIN),
  DiscussionControllers.deleteDiscussion
);

// Comment routes
router.post(
  "/comments",
  checkAuth(Role.OWNER, Role.ADMIN),
  validateRequest(DiscussionValidations.createCommentValidationSchema),
  DiscussionControllers.createComment
);
router.patch(
  "/comments/:id",
  checkAuth(Role.OWNER, Role.ADMIN),
  validateRequest(DiscussionValidations.updateCommentValidationSchema),
  DiscussionControllers.updateComment
);
router.delete(
  "/comments/:id",
  checkAuth(Role.OWNER, Role.ADMIN),
  DiscussionControllers.deleteComment
);

export const discussionRouter = router;