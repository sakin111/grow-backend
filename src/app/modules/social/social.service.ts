import { prisma } from "../../lib/prisma";
import { IPostCreate, IPostUpdate, IFeedFilter } from "./social.interface";


const createPost = async (userId: string, payload: IPostCreate) => {
  const company = await prisma.company.findUnique({
    where: { id: payload.companyId },
  });

  if (!company || company.ownerId !== userId) {
    throw new Error("You are not authorized to post for this company");
  }

  const result = await prisma.post.create({
    data: payload,
  });
  return result;
};

const getPostById = async (id: string) => {
  const result = await prisma.post.findUnique({
    where: { id, isDeleted: false },
    include: {
      company: true,
      _count: {
        select: { likes: true, saves: true, shares: true },
      },
    },
  });
  return result;
};

const updatePost = async (userId: string, id: string, payload: IPostUpdate) => {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!post || post.company.ownerId !== userId) {
    throw new Error("You are not authorized to update this post");
  }

  const result = await prisma.post.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deletePost = async (userId: string, id: string) => {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!post || post.company.ownerId !== userId) {
    throw new Error("You are not authorized to delete this post");
  }

  const result = await prisma.post.update({
    where: { id },
    data: { isDeleted: true },
  });
  return result;
};

const toggleLike = async (userId: string, payload: { postId?: string; discussionId?: string }) => {
  const { postId, discussionId } = payload;

  const existingLike = await prisma.like.findFirst({
    where: {
      userId,
      postId: postId || null,
      discussionId: discussionId || null,
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
    return { liked: false };
  } else {
    await prisma.like.create({
      data: {
        userId,
        postId,
        discussionId,
      },
    });
    return { liked: true };
  }
};

const followCompany = async (followerUserId: string, followingId: string) => {
  const followerCompany = await prisma.company.findUnique({
    where: { ownerId: followerUserId },
  });

  if (!followerCompany) {
    throw new Error("You must have a company to follow other companies");
  }

  if (followerCompany.id === followingId) {
    throw new Error("You cannot follow your own company");
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: followerCompany.id,
        followingId,
      },
    },
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });
    return { followed: false };
  } else {
    await prisma.follow.create({
      data: {
        followerId: followerCompany.id,
        followingId,
      },
    });
    return { followed: true };
  }
};

const getSocialFeed = async (userId: string, filters: IFeedFilter) => {
  const { topic, searchTerm, page = 1, limit = 10, sortBy } = filters;
  const skip = (page - 1) * limit;

  const userCompany = await prisma.company.findUnique({
    where: { ownerId: userId },
  });

  let followingIds: string[] = [];
  if (userCompany) {
    const following = await prisma.follow.findMany({
      where: { followerId: userCompany.id },
      select: { followingId: true },
    });
    followingIds = following.map((f) => f.followingId);
  }

  const whereCondition: any = {
    isDeleted: false,
  };

  if (topic) {
    whereCondition.topic = topic;
  }

  if (searchTerm) {
    whereCondition.content = { contains: searchTerm, mode: "insensitive" };
  }

  // Fetch posts with a base ordering
  const result = await prisma.post.findMany({
    where: whereCondition,
    include: {
      company: true,
      _count: {
        select: { likes: true, saves: true, shares: true },
      },
      likes: {
        where: { userId },
        take: 1,
      },
    },
    orderBy: sortBy === "trending"
      ? { likes: { _count: "desc" } }
      : { createdAt: "desc" },
    skip,
    take: limit,
  });

  // Professional Approach: Prioritize followed companies in the returned list
  // Note: For large datasets and deep pagination, this should be done via raw SQL or a dedicated search engine.
  // For standard feed usage, we can sort the fetched batch if necessary, 
  // but usually "followed first" is a filter or a specific feed tab.
  // Here we sort the current page results to put followed companies at the top.
  if (followingIds.length > 0 && sortBy !== "trending") {
    result.sort((a, b) => {
      const aFollowed = followingIds.includes(a.companyId) ? 1 : 0;
      const bFollowed = followingIds.includes(b.companyId) ? 1 : 0;
      return bFollowed - aFollowed;
    });
  }

  return result;
};


export const SocialService = {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  followCompany,
  getSocialFeed,
};
