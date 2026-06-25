import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status";
import { ICreateDiscussionPayload, IUpdateDiscussionPayload } from "./discussion.interface";
import { QueryBuilder } from "../../shared/QueryBuilder";
import { sendInAppNotification } from "../notification/notification.utils";

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

const getAllDiscussions = async (query: Record<string, any>) => {
  const discussionQuery = new QueryBuilder(prisma.discussion, query)
    .search(["title", "content"])
    .filter(["companyId", "topic"])
    .addWhere({ isDeleted: false })
    .relation({
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: { comments: { where: { isDeleted: false } } },
      },
    })
    .sort("-createdAt")
    .paginate()
    .fields();

  if (query.companyId) {
    discussionQuery.addWhere({ companyId: query.companyId });
  }
  if (query.topic) {
    discussionQuery.addWhere({ topic: query.topic });
  }

  const data = await discussionQuery.build();
  const meta = await discussionQuery.getMeta();

  return {
    meta,
    data,
  };
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


const createComment = async (userId: string, payload: any) => {

  const company = await prisma.company.findUnique({
    where: { id: payload.companyId },
  });

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, "Company not found");
  }

  if (company.ownerId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to comment from this company"
    );
  }

  const comment = await prisma.comment.create({
    data: payload,
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      discussion: {
        include: {
          company: true
        }
      }
    },
  });


  if (comment.discussion && comment.discussion.company.ownerId !== userId) {
    await sendInAppNotification({
      userId: comment.discussion.company.ownerId,
      type: "NEW_COMMENT",
      title: "New Comment on Discussion",
      message: `A new comment was added to your discussion: ${comment.discussion.title}`,
      data: { discussionId: comment.discussionId, commentId: comment.id }
    });
  }

  return comment;
};

const updateComment = async (commentId: string, userId: string, content: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId, isDeleted: false },
    include: { company: true },
  });

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  if (comment.company?.ownerId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this comment"
    );
  }

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { content, isEdited: true },
  });

  return updatedComment;
};

const deleteComment = async (commentId: string, userId: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId, isDeleted: false },
    include: { company: true },
  });

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  if (comment.company?.ownerId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this comment"
    );
  }

  const deletedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { isDeleted: true },
  });

  return deletedComment;
};

export const DiscussionServices = {
  createDiscussion,
  getAllDiscussions,
  getSingleDiscussion,
  updateDiscussion,
  deleteDiscussion,
  createComment,
  updateComment,
  deleteComment,
};
