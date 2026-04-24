import { Topic } from "@prisma/client";

export interface IDiscussion {
  id: string;
  title: string;
  content: string;
  topic: Topic;
  companyId: string;
  isPublic: boolean;
  isDeleted: boolean;
  createdAt: Date;
}

export interface ICreateDiscussionPayload {
  title: string;
  content: string;
  topic: Topic;
  companyId: string;
  isPublic?: boolean;
}

export interface IUpdateDiscussionPayload {
  title?: string;
  content?: string;
  topic?: Topic;
  isPublic?: boolean;
}

export interface IJwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface ICreateCommentPayload {
  content: string;
  discussionId: string;
  companyId: string;
}

export interface IUpdateCommentPayload {
  content: string;
}