import { z } from "zod";

const createBookingSchema = z.object({
  body: z.object({
    mentorId: z.string().uuid("Invalid mentor ID"),
    startTime: z.string().datetime("Invalid start time format (use ISO 8601)"),
    endTime: z.string().datetime("Invalid end time format (use ISO 8601)"),
  }),
});

const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"] as const, {
      message: "Status must be CONFIRMED, CANCELLED, or COMPLETED"
    }),
  }),
});

export const SessionValidation = {
  createBookingSchema,
  updateBookingStatusSchema,
};
