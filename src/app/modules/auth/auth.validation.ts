import { error } from "console";
import { z } from "zod";

const forgotPasswordValidationSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address")
    })
});

const resetPasswordValidationSchema = z.object({
    body: z.object({
        id: z.string({
            error: "User ID is required"
        }),
        newPassword: z.string({
            error: "New password is required"
        }).min(6, "Password must be at least 6 characters long")
    })
});

export const AuthValidation = {
    forgotPasswordValidationSchema,
    resetPasswordValidationSchema
};
