import { z } from "zod";

const DayOfWeekEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createMentorProfileSchema = z.object({
  body: z.object({
    bio: z.string().min(10, "Bio must be at least 10 characters"),
    expertise: z
      .array(z.string().min(1))
      .min(1, "At least one expertise is required"),
    Token: z.number().positive("Token pricing must be positive"),
    categories: z
      .array(z.string().min(1))
      .min(1, "At least one category is required"),
  }),
});

const updateMentorProfileSchema = z.object({
  body: z.object({
    bio: z.string().min(10, "Bio must be at least 10 characters").optional(),
    expertise: z
      .array(z.string().min(1))
      .min(1, "At least one expertise is required")
      .optional(),
    Token: z.number().positive("Token pricing must be positive").optional(),
    categories: z
      .array(z.string().min(1))
      .min(1, "At least one category is required")
      .optional(),
  }),
});

const createAvailabilitySchema = z.object({
  body: z.object({
    dayOfWeek: DayOfWeekEnum,
    startTime: z
      .string()
      .regex(timeRegex, "Start time must be in HH:MM format"),
    endTime: z.string().regex(timeRegex, "End time must be in HH:MM format"),
  }),
});

const updateAvailabilitySchema = z.object({
  body: z.object({
    dayOfWeek: DayOfWeekEnum.optional(),
    startTime: z
      .string()
      .regex(timeRegex, "Start time must be in HH:MM format")
      .optional(),
    endTime: z
      .string()
      .regex(timeRegex, "End time must be in HH:MM format")
      .optional(),
  }),
});

export const MentorValidation = {
  createMentorProfileSchema,
  updateMentorProfileSchema,
  createAvailabilitySchema,
  updateAvailabilitySchema,
};
