import { Topic } from "@prisma/client";

export interface IPostCreate {
  content: string;
  image?: string;
  topic: Topic;
  companyId: string;
}

export interface IPostUpdate {
  content?: string;
  image?: string;
  topic?: Topic;
}

export interface IFeedFilter {
  topic?: Topic;
  companyId?: string;
  searchTerm?: string;
  sortBy?: "recent" | "trending";
  page?: number;
  limit?: number;
}

export interface ICommentCreate {
  content: string;
  postId?: string;
  parentId?: string;
}

export interface ICommentUpdate {
  content?: string;
}

