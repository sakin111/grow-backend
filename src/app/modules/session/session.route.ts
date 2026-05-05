import { Router } from "express";
import { SessionControllers } from "./session.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { SessionValidation } from "./session.validation";
import { Role } from "@prisma/client";

const router = Router();


router.post(
    "/booking",
    checkAuth(Role.OWNER),
    validateRequest(SessionValidation.createBookingSchema),
    SessionControllers.createBooking
);


router.get(
    "/booking/my",
    checkAuth(Role.OWNER, Role.MENTOR),
    SessionControllers.getMyBookings
);


router.get(
    "/booking/all",
    checkAuth(Role.ADMIN),
    SessionControllers.getAllBookings
);


router.get(
    "/booking/:bookingId",
    checkAuth(Role.OWNER, Role.MENTOR, Role.ADMIN),
    SessionControllers.getSingleBooking
);


router.patch(
    "/booking/:bookingId/confirm",
    checkAuth(Role.MENTOR),
    SessionControllers.confirmBooking
);


router.patch(
    "/booking/:bookingId/cancel",
    checkAuth(Role.OWNER, Role.MENTOR),
    SessionControllers.cancelBooking
);


router.patch(
    "/booking/:bookingId/complete",
    checkAuth(Role.MENTOR),
    SessionControllers.completeBooking
);

export const sessionRouter = router;
