import { Router } from "express";
import { SocialController } from "./social.controller";
import { Role } from "@prisma/client";
import { SocialValidation } from "./social.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

router.get("/feed", checkAuth(Role.OWNER, Role.MENTOR, Role.ADMIN), SocialController.getSocialFeed);

router.post(
  "/post",
  checkAuth(Role.OWNER),
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

export const SocialRoutes = router;
