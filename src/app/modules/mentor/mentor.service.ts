import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status";
import {
  ICreateAvailability,
  ICreateMentorProfile,
  IUpdateMentorProfile,
} from "./mentor.interface";
import { QueryBuilder } from "../../shared/QueryBuilder";
const createMentorProfile = async (
  userId: string,
  payload: ICreateMentorProfile
) => {
  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const existingProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });
  if (existingProfile) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User already has a mentor profile"
    );
  }

  const profile = await prisma.mentorProfile.create({
    data: {
      ...payload,
      userId,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, picture: true },
      },
    },
  });

  return profile;
};

const getMentorProfile = async (mentorId: string) => {
  const profile = await prisma.mentorProfile.findUnique({
    where: { id: mentorId },
    include: {
      user: {
        select: { id: true, name: true, email: true, picture: true },
      },
      availability: true,
      reviews: {
        include: {
          owner: {
            select: { id: true, name: true, picture: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { bookings: true, reviews: true },
      },
    },
  });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Mentor profile not found");
  }

  return profile;
};

const getMyMentorProfile = async (userId: string) => {
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, name: true, email: true, picture: true },
      },
      availability: true,
      reviews: {
        include: {
          owner: {
            select: { id: true, name: true, picture: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      bookings: {
        include: {
          owner: {
            select: { id: true, name: true, email: true, picture: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { bookings: true, reviews: true },
      },
    },
  });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "You don't have a mentor profile");
  }

  return profile;
};

const updateMentorProfile = async (
  userId: string,
  payload: IUpdateMentorProfile
) => {
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Mentor profile not found");
  }

  const updatedProfile = await prisma.mentorProfile.update({
    where: { userId },
    data: payload,
    include: {
      user: {
        select: { id: true, name: true, email: true, picture: true },
      },
    },
  });

  return updatedProfile;
};

const deleteMentorProfile = async (userId: string) => {
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Mentor profile not found");
  }

  const deletedProfile = await prisma.mentorProfile.delete({
    where: { userId },
  });

  return deletedProfile;
};



const addAvailability = async (
  userId: string,
  payload: ICreateAvailability
) => {
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Create a mentor profile first"
    );
  }


  const existingSlot = await prisma.mentorAvailability.findFirst({
    where: {
      mentorId: profile.id,
      dayOfWeek: payload.dayOfWeek,
      OR: [
        {
          AND: [
            { startTime: { lte: payload.startTime } },
            { endTime: { gt: payload.startTime } },
          ],
        },
        {
          AND: [
            { startTime: { lt: payload.endTime } },
            { endTime: { gte: payload.endTime } },
          ],
        },
        {
          AND: [
            { startTime: { gte: payload.startTime } },
            { endTime: { lte: payload.endTime } },
          ],
        },
      ],
    },
  });

  if (existingSlot) {
    throw new AppError(
      httpStatus.CONFLICT,
      "This time slot overlaps with an existing availability"
    );
  }

  const availability = await prisma.mentorAvailability.create({
    data: {
      mentorId: profile.id,
      ...payload,
    },
  });

  return availability;
};

const getAvailability = async (mentorId: string) => {
  const profile = await prisma.mentorProfile.findUnique({
    where: { id: mentorId },
  });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Mentor profile not found");
  }

  const availability = await prisma.mentorAvailability.findMany({
    where: { mentorId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return availability;
};

const updateAvailability = async (
  userId: string,
  slotId: string,
  payload: Partial<ICreateAvailability>
) => {
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Mentor profile not found");
  }

  const slot = await prisma.mentorAvailability.findUnique({
    where: { id: slotId },
  });

  if (!slot) {
    throw new AppError(httpStatus.NOT_FOUND, "Availability slot not found");
  }

  if (slot.mentorId !== profile.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update your own availability"
    );
  }

  const updatedSlot = await prisma.mentorAvailability.update({
    where: { id: slotId },
    data: payload,
  });

  return updatedSlot;
};

const deleteAvailability = async (userId: string, slotId: string) => {
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Mentor profile not found");
  }

  const slot = await prisma.mentorAvailability.findUnique({
    where: { id: slotId },
  });

  if (!slot) {
    throw new AppError(httpStatus.NOT_FOUND, "Availability slot not found");
  }

  if (slot.mentorId !== profile.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only delete your own availability"
    );
  }

  const deletedSlot = await prisma.mentorAvailability.delete({
    where: { id: slotId },
  });

  return deletedSlot;
};



const searchMentors = async (query: Record<string, any>) => {
  const mentorQuery = new QueryBuilder(prisma.mentorProfile, query)
    .search(["bio"])
    .filter(["expertise", "category", "minRating", "maxRating", "minPrice", "maxPrice"])
    .relation({
      user: {
        select: { id: true, name: true, email: true, picture: true },
      },
      availability: true,
      _count: {
        select: { bookings: true, reviews: true },
      },
    })
    .sort("-avgRating")
    .paginate()
    .fields();

  if (query.expertise) {
    mentorQuery.addWhere({ expertise: { has: query.expertise } });
  }

  if (query.category) {
    mentorQuery.addWhere({ categories: { has: query.category } });
  }

  if (query.minRating) {
    mentorQuery.addWhere({ avgRating: { gte: parseFloat(query.minRating) } });
  }

  if (query.maxRating) {
    mentorQuery.addWhere({ avgRating: { lte: parseFloat(query.maxRating) } });
  }

  if (query.minPrice) {
    mentorQuery.addWhere({ Token: { gte: parseFloat(query.minPrice) } });
  }

  if (query.maxPrice) {
    mentorQuery.addWhere({ Token: { lte: parseFloat(query.maxPrice) } });
  }

  const data = await mentorQuery.build();
  const meta = await mentorQuery.getMeta();

  return { meta, data };
};

export const MentorServices = {
  createMentorProfile,
  getMentorProfile,
  getMyMentorProfile,
  updateMentorProfile,
  deleteMentorProfile,
  addAvailability,
  getAvailability,
  updateAvailability,
  deleteAvailability,
  searchMentors,
};
