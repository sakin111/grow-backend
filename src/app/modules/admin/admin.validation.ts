import { z } from "zod";
import { UserStatus, VerificationStatus } from "@prisma/client";

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(UserStatus),
  }),
});

const verifyCompanyValidationSchema = z.object({
  body: z.object({
    status: z.enum(VerificationStatus),
  }),
});

export const AdminValidations = {
  updateUserStatusValidationSchema,
  verifyCompanyValidationSchema,
};
