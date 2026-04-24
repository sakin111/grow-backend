import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status";
import { ICreateDiscussionPayload, IUpdateDiscussionPayload } from "./discussion.interface";

const createDiscussion = async (userId: string, payload: ICreateDiscussionPayload) => {
  // Check if company exists and user has access to it
  const company = await prisma.company.findUnique({
    where: { id: payload.companyId },
  });

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, "Company not found");
  }

  if (company.ownerId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to create discussions for this company"
    );
  }

  const discussion = await prisma.discussion.create({
    data: {
      ...payload,
      isPublic: payload.isPublic ?? true,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      comments: true,
    },
  });

  return discussion;
};

const getAllDiscussions = async (companyId?: string) => {
  const whereClause = companyId ? { companyId, isDeleted: false } : { isDeleted: false };

  const discussions = await prisma.discussion.findMany({
    where: whereClause,
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      comments: {
        where: { isDeleted: false },
        select: {
          id: true,
          content: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return discussions;
};

const getSingleDiscussion = async (discussionId: string) => {
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId, isDeleted: false },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      comments: {
        where: { isDeleted: false },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!discussion) {
    throw new AppError(httpStatus.NOT_FOUND, "Discussion not found");
  }

  return discussion;
};

const updateDiscussion = async (
  discussionId: string,
  userId: string,
  payload: IUpdateDiscussionPayload
) => {
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId, isDeleted: false },
    include: {
      company: true,
    },
  });

  if (!discussion) {
    throw new AppError(httpStatus.NOT_FOUND, "Discussion not found");
  }

  if (discussion.company.ownerId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this discussion"
    );
  }

  const updatedDiscussion = await prisma.discussion.update({
    where: { id: discussionId },
    data: payload,
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      comments: true,
    },
  });

  return updatedDiscussion;
};

const deleteDiscussion = async (discussionId: string, userId: string) => {
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId, isDeleted: false },
    include: {
      company: true,
    },
  });

  if (!discussion) {
    throw new AppError(httpStatus.NOT_FOUND, "Discussion not found");
  }

  if (discussion.company.ownerId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this discussion"
    );
  }

  // Soft delete the discussion
  const deletedDiscussion = await prisma.discussion.update({
    where: { id: discussionId },
    data: {
      isDeleted: true,
    },
  });

  return deletedDiscussion;
};

const getDiscussionsByTopic = async (topic: string) => {
  const discussions = await prisma.discussion.findMany({
    where: {
      topic: topic as any,
      isDeleted: false,
      isPublic: true,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      comments: {
        where: { isDeleted: false },
        select: {
          id: true,
          content: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return discussions;
};

export const DiscussionServices = {
  createDiscussion,
  getAllDiscussions,
  getSingleDiscussion,
  updateDiscussion,
  deleteDiscussion,
  getDiscussionsByTopic,
};