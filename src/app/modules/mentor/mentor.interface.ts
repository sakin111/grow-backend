import { DayOfWeek } from "@prisma/client";

export interface IJwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface ICreateMentorProfile {
  bio: string;
  expertise: string[];
  Token: number;
  categories: string[];
}

export interface IUpdateMentorProfile {
  bio?: string;
  expertise?: string[];
  Token?: number;
  categories?: string[];
}

export interface ICreateAvailability {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface IMentorSearchFilters {
  searchTerm?: string;
  expertise?: string;
  category?: string;
  minRating?: number;
  maxRating?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
}
