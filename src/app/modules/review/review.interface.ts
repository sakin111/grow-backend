export interface IJwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface ICreateReview {
  bookingId: string;
  rating: number;
  comment: string;
}

export interface IUpdateReview {
  rating?: number;
  comment?: string;
}
