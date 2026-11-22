import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status";
import { BookingStatus, SessionStatus } from "@prisma/client";
import { ICreateBooking } from "./session.interface";
import { sendInAppNotification } from "../notification/notification.utils";
import { AccessToken, TrackSource } from "livekit-server-sdk";
import { envVar } from "../../config/envVar";
import {
    chargeBookingCredits,
    createMentorPayout,
    refundBookingCredits,
} from "../billing/billing.service";



const createBooking = async (ownerId: string, payload: ICreateBooking) => {

    const mentor = await prisma.mentorProfile.findUnique({
        where: { id: payload.mentorId },
        include: { user: true },
    });

    if (!mentor) {
        throw new AppError(httpStatus.NOT_FOUND, "Mentor not found");
    }

    if (!mentor.isActive) {
        throw new AppError(
            httpStatus.CONFLICT,
            "Mentor is not accepting booking requests"
        );
    }

    if (mentor.stripeSubscriptionStatus !== "active") {
        throw new AppError(
            httpStatus.CONFLICT,
            "Mentor subscription is not active and cannot accept bookings",
        );
    }

    if (!mentor.payoutsEnabled) {
        throw new AppError(
            httpStatus.CONFLICT,
            "Mentor must finish Stripe payout onboarding before accepting bookings",
        );
    }

    if (!Number.isSafeInteger(mentor.Token) || mentor.Token <= 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Mentor booking price must be a positive whole number of credits",
        );
    }

    if (mentor.userId === ownerId) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "You cannot book a session with yourself"
        );
    }

    const startTime = new Date(payload.startTime);
    const endTime = new Date(payload.endTime);


    if (startTime >= endTime) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Start time must be before end time"
        );
    }

    if (startTime <= new Date()) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Cannot book a session in the past"
        );
    }


    const booking = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT "id" FROM "mentor_profile" WHERE "id" = ${payload.mentorId} FOR UPDATE`;

        const conflictingBooking = await tx.sessionBooking.findFirst({
            where: {
                mentorId: payload.mentorId,
                status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
                OR: [
                    {
                        AND: [
                            { startTime: { lte: startTime } },
                            { endTime: { gt: startTime } },
                        ],
                    },
                    {
                        AND: [
                            { startTime: { lt: endTime } },
                            { endTime: { gte: endTime } },
                        ],
                    },
                    {
                        AND: [
                            { startTime: { gte: startTime } },
                            { endTime: { lte: endTime } },
                        ],
                    },
                ],
            },
        });

        if (conflictingBooking) {
            throw new AppError(
                httpStatus.CONFLICT,
                "This time slot conflicts with an existing booking"
            );
        }

        const createdBooking = await tx.sessionBooking.create({
            data: {
                ownerId,
                mentorId: payload.mentorId,
                creditsCharged: mentor.Token,
                startTime,
                endTime,
            },
            include: {
                owner: {
                    select: { id: true, name: true, email: true, picture: true },
                },
                mentor: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, picture: true },
                        },
                    },
                },
            },
        });
        await chargeBookingCredits(tx, ownerId, createdBooking.id, mentor.Token);
        return createdBooking;
    });

    await sendInAppNotification({
        userId: mentor.userId,
        type: "BOOKING_CREATED",
        title: "New Session Booking",
        message: `You have a new booking request from ${booking.owner.name}`,
        data: { bookingId: booking.id }
    });

    return booking;
};



const confirmBooking = async (mentorUserId: string, bookingId: string) => {
    const booking = await prisma.sessionBooking.findUnique({
        where: { id: bookingId },
        include: { mentor: true },
    });

    if (!booking) {
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    if (booking.mentor.userId !== mentorUserId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "Only the mentor can confirm this booking"
        );
    }

    if (booking.status !== BookingStatus.PENDING) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `Cannot confirm a booking that is ${booking.status}`
        );
    }

    const updatedBooking = await prisma.sessionBooking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CONFIRMED },
        include: {
            owner: {
                select: { id: true, name: true, email: true, picture: true },
            },
            mentor: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, picture: true },
                    },
                },
            },
        },
    });

    await sendInAppNotification({
        userId: updatedBooking.ownerId,
        type: "BOOKING_CONFIRMED",
        title: "Booking Confirmed",
        message: `Your booking with ${updatedBooking.mentor.user.name} has been confirmed`,
        data: { bookingId: updatedBooking.id }
    });

    return updatedBooking;
};



const cancelBooking = async (userId: string, bookingId: string) => {
    const updatedBooking = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT "id" FROM "session_booking" WHERE "id" = ${bookingId} FOR UPDATE`;
        const booking = await tx.sessionBooking.findUnique({
            where: { id: bookingId },
            include: { mentor: true },
        });

        if (!booking) {
            throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
        }
        if (booking.ownerId !== userId && booking.mentor.userId !== userId) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to cancel this booking"
            );
        }
        if (
            booking.status === BookingStatus.COMPLETED ||
            booking.status === BookingStatus.CANCELLED
        ) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `Cannot cancel a booking that is already ${booking.status}`
            );
        }

        const cancelledBooking = await tx.sessionBooking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.CANCELLED },
            include: {
                owner: {
                    select: { id: true, name: true, email: true, picture: true },
                },
                mentor: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, picture: true },
                        },
                    },
                },
            },
        });
        await refundBookingCredits(tx, booking.ownerId, bookingId);
        return cancelledBooking;
    });

    // Notify the other party
    const notifyUserId = updatedBooking.ownerId === userId ? updatedBooking.mentor.userId : updatedBooking.ownerId;
    const cancellerName = updatedBooking.ownerId === userId ? updatedBooking.owner.name : updatedBooking.mentor.user.name;

    await sendInAppNotification({
        userId: notifyUserId,
        type: "BOOKING_CANCELLED",
        title: "Booking Cancelled",
        message: `Booking has been cancelled by ${cancellerName}`,
        data: { bookingId: updatedBooking.id }
    });

    return updatedBooking;
};



const completeBooking = async (
    mentorUserId: string,
    bookingId: string,
    completeVideoSession = false,
) => {
    const booking = await prisma.sessionBooking.findUnique({
        where: { id: bookingId },
        include: { mentor: true, creditAllocations: { where: { refundedAt: null } } },
    });

    if (!booking) {
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }


    if (booking.mentor.userId !== mentorUserId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            completeVideoSession
                ? "Only the mentor can end this session"
                : "Only the mentor can complete this booking"
        );
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only confirmed bookings can be marked as completed"
        );
    }

    const transfer = await createMentorPayout(bookingId, booking.mentorId);

    const updatedBooking = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT "id" FROM "session_booking" WHERE "id" = ${bookingId} FOR UPDATE`;
        const currentBooking = await tx.sessionBooking.findUnique({
            where: { id: bookingId },
            select: { status: true },
        });
        if (!currentBooking || currentBooking.status !== BookingStatus.CONFIRMED) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Only confirmed bookings can be marked as completed",
            );
        }

        const completedBooking = await tx.sessionBooking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.COMPLETED },
            include: {
                owner: {
                    select: { id: true, name: true, email: true, picture: true },
                },
                mentor: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, picture: true },
                        },
                    },
                },
            },
        });
        if (transfer) {
            await tx.mentorPayout.upsert({
                where: { bookingId },
                update: {},
                create: {
                    bookingId,
                    mentorId: booking.mentorId,
                    amountCents: transfer.amountCents,
                    stripeTransferId: transfer.id,
                },
            });
        }
        if (completeVideoSession) {
            await tx.videoSession.update({
                where: { bookingId },
                data: { status: SessionStatus.COMPLETED },
            });
        }
        return completedBooking;
    });

    return updatedBooking;
};



const getMyBookings = async (
    userId: string,
    role: string,
    query: Record<string, any>
) => {
    const where: Record<string, any> = {};

    if (role === "MENTOR") {
        const mentorProfile = await prisma.mentorProfile.findUnique({
            where: { userId },
        });

        if (!mentorProfile) {
            throw new AppError(httpStatus.NOT_FOUND, "Mentor profile not found");
        }

        where.mentorId = mentorProfile.id;
    } else {
        where.ownerId = userId;
    }


    if (query.status) {
        where.status = query.status;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        prisma.sessionBooking.findMany({
            where,
            include: {
                owner: {
                    select: { id: true, name: true, email: true, picture: true },
                },
                mentor: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, picture: true },
                        },
                    },
                },
                review: true,
                videoSession: true,
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip,
        }),
        prisma.sessionBooking.count({ where }),
    ]);

    const totalPage = Math.ceil(total / limit);

    return {
        meta: {
            page,
            limit,
            total,
            totalPage,
            hasNextPage: page < totalPage,
            hasPrevPage: page > 1,
        },
        data,
    };
};

const getSingleBooking = async (userId: string, bookingId: string) => {
    const booking = await prisma.sessionBooking.findUnique({
        where: { id: bookingId },
        include: {
            owner: {
                select: { id: true, name: true, email: true, picture: true },
            },
            mentor: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, picture: true },
                    },
                },
            },
            review: true,
            videoSession: true,
        },
    });

    if (!booking) {
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    if (booking.ownerId !== userId && booking.mentor.userId !== userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to view this booking"
        );
    }

    return booking;
};


const getAllBookings = async (query: Record<string, any>) => {
    const where: Record<string, any> = {};

    if (query.status) {
        where.status = query.status;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        prisma.sessionBooking.findMany({
            where,
            include: {
                owner: {
                    select: { id: true, name: true, email: true, picture: true },
                },
                mentor: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, picture: true },
                        },
                    },
                },
                review: true,
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip,
        }),
        prisma.sessionBooking.count({ where }),
    ]);

    const totalPage = Math.ceil(total / limit);

    return {
        meta: {
            page,
            limit,
            total,
            totalPage,
            hasNextPage: page < totalPage,
            hasPrevPage: page > 1,
        },
        data,
    };
};

const startSession = async (mentorUserId: string, bookingId: string) => {
    const booking = await prisma.sessionBooking.findUnique({
        where: { id: bookingId },
        include: { mentor: { include: { user: true } }, videoSession: true },
    });

    if (!booking) {
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    if (booking.mentor.userId !== mentorUserId) {
        throw new AppError(httpStatus.FORBIDDEN, "Only the mentor can start this session");
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Only confirmed bookings can be started");
    }

    // Generate LiveKit token for mentor (host)
    const at = new AccessToken(envVar.LIVEKIT_API_KEY, envVar.LIVEKIT_API_SECRET, {
        identity: mentorUserId,
        name: booking.mentor.user.name,
    });
    at.addGrant({
        roomJoin: true,
        room: bookingId,
        canPublish: true,
        canPublishSources: [TrackSource.MICROPHONE, TrackSource.CAMERA],
        canSubscribe: true,
    });
    const token = await at.toJwt();

    // Create or update video session
    if (!booking.videoSession) {
        await prisma.videoSession.create({
            data: {
                bookingId: bookingId,
                mentorId: booking.mentorId,
                ownerId: booking.ownerId,
                meetingLink: `${envVar.FRONTEND_URL}/session/${bookingId}`,
                status: SessionStatus.ONGOING,
            }
        });
    } else {
        await prisma.videoSession.update({
            where: { bookingId: bookingId },
            data: { status: SessionStatus.ONGOING }
        });
    }

    return { token, serverUrl: envVar.LIVEKIT_HOST };
};

const joinSession = async (userId: string, bookingId: string) => {
    const booking = await prisma.sessionBooking.findUnique({
        where: { id: bookingId },
        include: { owner: true, mentor: { include: { user: true } }, videoSession: true },
    });

    if (!booking) {
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    if (booking.ownerId !== userId && booking.mentor.userId !== userId) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to join this session");
    }

    if (!booking.videoSession || booking.videoSession.status !== SessionStatus.ONGOING) {
        throw new AppError(httpStatus.BAD_REQUEST, "The session has not started yet or has already ended");
    }

    const user = booking.ownerId === userId ? booking.owner : booking.mentor.user;

    // Generate LiveKit token for participant (subscriber)
    const at = new AccessToken(envVar.LIVEKIT_API_KEY, envVar.LIVEKIT_API_SECRET, {
        identity: userId,
        name: user.name,
    });
    at.addGrant({
        roomJoin: true,
        room: bookingId,
        canPublish: true,
        canPublishSources: [TrackSource.MICROPHONE, TrackSource.CAMERA],
        canSubscribe: true,
    });
    const token = await at.toJwt();

    return { token, serverUrl: envVar.LIVEKIT_HOST };
};

const endSession = async (mentorUserId: string, bookingId: string) => {
    await completeBooking(mentorUserId, bookingId, true);

    return { message: "Session ended successfully" };
};

export const SessionServices = {
    createBooking,
    confirmBooking,
    cancelBooking,
    completeBooking,
    getMyBookings,
    getSingleBooking,
    getAllBookings,
    startSession,
    joinSession,
    endSession,
};
