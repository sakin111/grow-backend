import { Router } from "express";
import { DiscussionControllers } from "./discussion.controller";


const router = Router()

router.post("/discussion", DiscussionControllers.createDiscussion)
router.get("/discussion", DiscussionControllers.getAllDiscussions)
router.get("/discussion/topic/:topic", DiscussionControllers.getDiscussionsByTopic)
router.get("/discussion/:id", DiscussionControllers.getSingleDiscussion)
router.patch("/discussion/:id", DiscussionControllers.updateDiscussion)
router.delete("/discussion/:id", DiscussionControllers.deleteDiscussion)

export const discussionRouter = router