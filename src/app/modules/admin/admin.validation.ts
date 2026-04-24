import { z } from "zod";
import { UserStatus, VerificationStatus } from "@prisma/client";

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.nativeEnum(UserStatus),
  }),
});

const verifyCompanyValidationSchema = z.object({
  body: z.object({
    status: z.nativeEnum(VerificationStatus),
  }),
});

export const AdminValidations = {
  updateUserStatusValidationSchema,
  verifyCompanyValidationSchema,
};
