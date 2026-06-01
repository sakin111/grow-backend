import z from "zod";



const reviewVerificationSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  adminNote: z.string().max(500).optional(),
});

const updateUserStatusValidationSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export const AdminValidation = {
  reviewVerificationSchema,
  updateUserStatusValidationSchema
};

export const adminValidation = {
  reviewVerificationSchema
}