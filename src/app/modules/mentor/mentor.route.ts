import { Router } from "express";
import { MentorControllers } from "./mentor.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { MentorValidation } from "./mentor.validation";
import { Role } from "@prisma/client";

const router = Router();

// ===================== MENTOR SEARCH (public-ish, any authenticated user) =====================
router.get(
  "/search",
  checkAuth(...Object.values(Role)),
  MentorControllers.searchMentors
);

// ===================== MENTOR PROFILE =====================
router.post(
  "/profile",
  checkAuth(Role.MENTOR),
  validateRequest(MentorValidation.createMentorProfileSchema),
  MentorControllers.createMentorProfile
);

router.get(
  "/profile/me",
  checkAuth(Role.MENTOR),
  MentorControllers.getMyMentorProfile
);

router.get(
  "/profile/:id",
  checkAuth(...Object.values(Role)),
  MentorControllers.getMentorProfile
);

router.patch(
  "/profile",
  checkAuth(Role.MENTOR),
  validateRequest(MentorValidation.updateMentorProfileSchema),
  MentorControllers.updateMentorProfile
);

router.delete(
  "/profile",
  checkAuth(Role.MENTOR, Role.ADMIN),
  MentorControllers.deleteMentorProfile
);

// ===================== MENTOR AVAILABILITY =====================
router.post(
  "/availability",
  checkAuth(Role.MENTOR),
  validateRequest(MentorValidation.createAvailabilitySchema),
  MentorControllers.addAvailability
);

router.get(
  "/availability/:mentorId",
  checkAuth(...Object.values(Role)),
  MentorControllers.getAvailability
);

router.patch(
  "/availability/:slotId",
  checkAuth(Role.MENTOR),
  validateRequest(MentorValidation.updateAvailabilitySchema),
  MentorControllers.updateAvailability
);

router.delete(
  "/availability/:slotId",
  checkAuth(Role.MENTOR),
  MentorControllers.deleteAvailability
);

export const mentorRouter = router;
