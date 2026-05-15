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


const getFollowingIdSet = async (userId: string): Promise<Set<string>> => {
  const userCompany = await prisma.company.findUnique({
    where: { ownerId: userId },
    select: { id: true },
  });

  if (!userCompany) return new Set();

  const following = await prisma.follow.findMany({
    where: { followerId: userCompany.id },
    select: { followingId: true },
  });

  return new Set(following.map((f) => f.followingId));
};


const postInclude = (userId: string) => ({
  company: true,
  _count: {
    select: { likes: true, saves: true, shares: true },
  },
  likes: {
    where: { userId },
    take: 1,
  },
});


const postOrderBy = (sortBy?: string) =>
  sortBy === "trending"
    ? { likes: { _count: "desc" as const } }
    : { createdAt: "desc" as const };


const prioritizeFollowed = <T extends { companyId: string }>(
  posts: T[],
  followingSet: Set<string>,
  shouldPrioritize: boolean,
) => {
  const annotated = posts.map((post) => ({
    ...post,
    isFollowed: followingSet.has(post.companyId),
  }));

  if (!shouldPrioritize || followingSet.size === 0) return annotated;

  const followed = annotated.filter((p) => p.isFollowed);
  const unfollowed = annotated.filter((p) => !p.isFollowed);

  return [...followed, ...unfollowed];
};

const getSocialFeed = async (userId: string, filters: IFeedFilter) => {
  const { topic, searchTerm, page = 1, limit = 10, sortBy } = filters;
  const skip = (page - 1) * limit;

  const whereCondition: any = {
    isDeleted: false,
  };

  if (topic) {
    whereCondition.topic = topic;
  }

  if (searchTerm) {
    whereCondition.content = { contains: searchTerm, mode: "insensitive" };
  }

  // Run data fetch and total count in parallel for efficiency
  const [posts, total, followingSet] = await Promise.all([
    prisma.post.findMany({
      where: whereCondition,
      include: postInclude(userId),
      orderBy: postOrderBy(sortBy),
      skip,
      take: limit,
    }),
    prisma.post.count({ where: whereCondition }),
    getFollowingIdSet(userId),
  ]);

  // Prioritize followed companies (skip for trending – engagement order matters more)
  const data = prioritizeFollowed(posts, followingSet, sortBy !== "trending");

  return {
    data,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const searchPosts = async (userId: string, query: any) => {
  const { searchTerm, topic, page = 1, limit = 10, sortBy } = query;
  const skip = (page - 1) * limit;

  const whereCondition: any = {
    isDeleted: false,
  };

  if (searchTerm) {
    whereCondition.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { content: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (topic) {
    whereCondition.topic = topic;
  }

  // Run data fetch and total count in parallel for efficiency
  const [posts, total, followingSet] = await Promise.all([
    prisma.post.findMany({
      where: whereCondition,
      include: postInclude(userId),
      orderBy: postOrderBy(sortBy),
      skip,
      take: limit,
    }),
    prisma.post.count({ where: whereCondition }),
    getFollowingIdSet(userId),
  ]);

  // Annotate with isFollowed and prioritize followed companies
  const data = prioritizeFollowed(posts, followingSet, sortBy !== "trending");

  return {
    data,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

export const SocialService = {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  followCompany,
  getSocialFeed,
  searchPosts,
};
