import { Router } from "express";
import { SocialController } from "./social.controller";
import { Role } from "@prisma/client";
import { SocialValidation } from "./social.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { upload } from "../../middleware/upload";

const router = Router();

router.get("/feed", checkAuth(Role.OWNER, Role.MENTOR, Role.ADMIN), SocialController.getSocialFeed);

router.post(
  "/post",
  checkAuth(Role.OWNER),
  upload.single('image'),
  validateRequest(SocialValidation.createPost),
  SocialController.createPost
);

router.get("/search-post", checkAuth(...Object.values(Role)), SocialController.searchPosts);

router.get("/post/:id", checkAuth(Role.OWNER, Role.MENTOR, Role.ADMIN), SocialController.getPostById);

router.patch(
  "/post/:id",
  checkAuth(Role.OWNER),
  validateRequest(SocialValidation.updatePost),
  SocialController.updatePost
);

router.delete("/post/:id", checkAuth(Role.OWNER), SocialController.deletePost);

router.post(
  "/like",
  checkAuth(Role.OWNER, Role.MENTOR),
  validateRequest(SocialValidation.toggleLike),
  SocialController.toggleLike
);

router.post(
  "/follow",
  checkAuth(Role.OWNER),
  validateRequest(SocialValidation.followCompany),
  SocialController.followCompany
);

router.post(
  "/comment",
  checkAuth(...Object.values(Role)),
  validateRequest(SocialValidation.createComment),
  SocialController.createComment
);


router.get("/comment/replies/:commentId", checkAuth(...Object.values(Role)), SocialController.getReplies);
router.get("/comment/:postId", checkAuth(...Object.values(Role)), SocialController.getComments);

router.patch(
  "/comment/:id",
  checkAuth(...Object.values(Role)),
  validateRequest(SocialValidation.updateComment),
  SocialController.updateComment
);

router.delete("/comment/:id", checkAuth(...Object.values(Role)), SocialController.deleteComment);

export const SocialRoutes = router;