import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status";
import { BookingStatus } from "@prisma/client";
import { ICreateReview, IUpdateReview } from "./review.interface";

const createReview = async (ownerId: string, payload: ICreateReview) => {
  // Check if booking exists
  const booking = await prisma.sessionBooking.findUnique({
    where: { id: payload.bookingId },
    include: { review: true, mentor: true },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  // Only the session owner can leave a review
  if (booking.ownerId !== ownerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only the session owner can leave a review"
    );
  }

  // Only completed sessions can be reviewed
  if (booking.status !== BookingStatus.COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can only review completed sessions"
    );
  }

  // Check if review already exists
  if (booking.review) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already reviewed this session"
    );
  }

  // Create review and update mentor's average rating in a transaction
  const review = await prisma.$transaction(async (tx) => {
    const newReview = await tx.review.create({
      data: {
        ownerId,
        mentorId: booking.mentorId,
        bookingId: payload.bookingId,
        rating: payload.rating,
        comment: payload.comment,
      },
      include: {
        owner: {
          select: { id: true, name: true, picture: true },
        },
        mentor: {
          include: {
            user: {
              select: { id: true, name: true, picture: true },
            },
          },
        },
        booking: true,
      },
    });

    // Recalculate average rating for the mentor
    const avgResult = await tx.review.aggregate({
      where: { mentorId: booking.mentorId },
      _avg: { rating: true },
    });

    await tx.mentorProfile.update({
      where: { id: booking.mentorId },
      data: { avgRating: avgResult._avg.rating || 0 },
    });

    return newReview;
  });

  return review;
};

const getReviewsByMentor = async (
  mentorId: string,
  query: Record<string, any>
) => {
  // Verify mentor exists
  const mentor = await prisma.mentorProfile.findUnique({
    where: { id: mentorId },
  });

  if (!mentor) {
    throw new AppError(httpStatus.NOT_FOUND, "Mentor not found");
  }

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where: { mentorId },
      include: {
        owner: {
          select: { id: true, name: true, picture: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.review.count({ where: { mentorId } }),
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

const getMyReviews = async (ownerId: string, query: Record<string, any>) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where: { ownerId },
      include: {
        mentor: {
          include: {
            user: {
              select: { id: true, name: true, picture: true },
            },
          },
        },
        booking: {
          select: { id: true, startTime: true, endTime: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.review.count({ where: { ownerId } }),
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

const updateReview = async (
  ownerId: string,
  reviewId: string,
  payload: IUpdateReview
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  if (review.ownerId !== ownerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update your own reviews"
    );
  }

  const updatedReview = await prisma.$transaction(async (tx) => {
    const updated = await tx.review.update({
      where: { id: reviewId },
      data: payload,
      include: {
        owner: {
          select: { id: true, name: true, picture: true },
        },
        mentor: {
          include: {
            user: {
              select: { id: true, name: true, picture: true },
            },
          },
        },
      },
    });

    // Recalculate average rating if rating changed
    if (payload.rating !== undefined) {
      const avgResult = await tx.review.aggregate({
        where: { mentorId: review.mentorId },
        _avg: { rating: true },
      });

      await tx.mentorProfile.update({
        where: { id: review.mentorId },
        data: { avgRating: avgResult._avg.rating || 0 },
      });
    }

    return updated;
  });

  return updatedReview;
};

const deleteReview = async (ownerId: string, reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  if (review.ownerId !== ownerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only delete your own reviews"
    );
  }

  const deletedReview = await prisma.$transaction(async (tx) => {
    const deleted = await tx.review.delete({
      where: { id: reviewId },
    });

    // Recalculate average rating
    const avgResult = await tx.review.aggregate({
      where: { mentorId: review.mentorId },
      _avg: { rating: true },
    });

    await tx.mentorProfile.update({
      where: { id: review.mentorId },
      data: { avgRating: avgResult._avg.rating || 0 },
    });

    return deleted;
  });

  return deletedReview;
};

export const ReviewServices = {
  createReview,
  getReviewsByMentor,
  getMyReviews,
  updateReview,
  deleteReview,
};
