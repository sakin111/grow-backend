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

const getPostById = async (id: string, userId: string) => {
  const post = await prisma.post.findUnique({
    where: { id, isDeleted: false },
    include: postInclude(userId),
  })

  if (!post) return null

  const { likes, ...rest } = post

  return {
    ...rest,
    isLiked: likes.length > 0,
    likesCount: rest._count.likes,
  }
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

const toggleLike = async (userId: string, payload: { postId?: string; discussionId?: string; commentId?: string }) => {
  const { postId, discussionId, commentId } = payload;

  const existingLike = await prisma.like.findFirst({
    where: { userId, postId: postId || null, discussionId: discussionId || null, commentId: commentId || null },
  });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
    if (postId) {
      await prisma.post.update({ where: { id: postId }, data: { likesCount: { decrement: 1 } } });
    }
    return { liked: false };
  } else {
    await prisma.like.create({ data: { userId, postId, discussionId, commentId } });
    if (postId) {
      await prisma.post.update({ where: { id: postId }, data: { likesCount: { increment: 1 } } });
    }
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
  const following = await prisma.follow.findMany({
    where: { follower: { ownerId: userId } },
    select: { followingId: true },
  });
  return new Set(following.map((f) => f.followingId));
};


const postInclude = (userId: string) => ({
  company: {
    select: {
      id: true,
      name: true,
      logo: true,
      verificationStatus: true, 
    },
  },
  _count: { select: { likes: true, saves: true, shares: true } },
  likes: { where: { userId }, take: 1 },
});


const postOrderBy = (sortBy?: string) =>
sortBy === "trending" ? { likesCount: "desc" as const } : { createdAt: "desc" as const };


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
  const { topic, searchTerm, page = 1, limit = 10, sortBy } = filters
  const skip = (page - 1) * limit

  const whereCondition: any = { isDeleted: false }
  if (topic) whereCondition.topic = topic
  if (searchTerm) whereCondition.content = { contains: searchTerm, mode: 'insensitive' }

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
  ])

  const prioritized = prioritizeFollowed(posts, followingSet, sortBy !== 'trending')

  const data = prioritized.map(post => ({
    ...post,
    isLiked: post.likes.length > 0,
    isFollowing: followingSet.has(post.companyId),
    likesCount: post._count.likes,
    likes: undefined,
  }))

  return {
    data,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / limit),
    },
  }
}

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

const createComment = async (userId: string, payload: { content: string; postId?: string; parentId?: string }) => {
  return await prisma.comment.create({
    data: {
      content: payload.content,
      userId,
      postId: payload.postId,
      parentId: payload.parentId,
    },
  });
};

const getComments = async (userId: string, postId: string, query: { page?: number; limit?: number }) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const comments = await prisma.comment.findMany({
    where: {
      postId,
      parentId: null,
      isDeleted: false,
    },
    include: {
      user: {
        select: { id: true, name: true, picture: true },
      },
      _count: {
        select: { likes: true, replies: { where: { isDeleted: false } } },
      },
      likes: {
        where: { userId },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  const total = await prisma.comment.count({
    where: { postId, parentId: null, isDeleted: false },
  });

  const data = comments.map(comment => ({
    ...comment,
    isLiked: comment.likes.length > 0,
    likesCount: comment._count.likes,
    repliesCount: comment._count.replies,
    likes: undefined,
  }));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getReplies = async (userId: string, commentId: string, query: { page?: number; limit?: number }) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const replies = await prisma.comment.findMany({
    where: {
      parentId: commentId,
      isDeleted: false,
    },
    include: {
      user: {
        select: { id: true, name: true, picture: true },
      },
      _count: {
        select: { likes: true },
      },
      likes: {
        where: { userId },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
    skip,
    take: limit,
  });

  const total = await prisma.comment.count({
    where: { parentId: commentId, isDeleted: false },
  });

  const data = replies.map(reply => ({
    ...reply,
    isLiked: reply.likes.length > 0,
    likesCount: reply._count.likes,
    likes: undefined,
  }));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const updateComment = async (userId: string, id: string, content: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment || comment.userId !== userId) {
    throw new Error("You are not authorized to update this comment");
  }

  return await prisma.comment.update({
    where: { id },
    data: { content, isEdited: true },
  });
};

const deleteComment = async (userId: string, id: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment || comment.userId !== userId) {
    throw new Error("You are not authorized to delete this comment");
  }

  return await prisma.comment.update({
    where: { id },
    data: { isDeleted: true },
  });
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
  createComment,
  getComments,
  getReplies,
  updateComment,
  deleteComment,
};
