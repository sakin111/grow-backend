import { BookingStatus } from "@prisma/client";

export interface IJwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface ICreateBooking {
  mentorId: string;
  startTime: string;
  endTime: string;
}

export interface IUpdateBookingStatus {
  status: BookingStatus;
}
