

import { z } from "zod";

 const createCompanySchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name too long"),

  industry: z
    .string()
    .min(1, "Industry is required")
    .max(100, "Industry too long"),

  size: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]),

  stage: z.enum([
    "Idea",
    "Early Stage",
    "Growth",
    "Established",
    "Enterprise",
  ]),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description too long"),
});




const updateCompanySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  industry: z.string().min(1).max(100).optional(),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]).optional(),
  stage: z
    .enum(["Idea", "Early Stage", "Growth", "Established", "Enterprise"])
    .optional(),
  description: z.string().min(10).max(2000).optional(),
});




 const requestVerificationSchema = z.object({
  website: z.url(),
  contactEmail: z.email(),
  note: z.string().max(500).optional(),
});


export const CompanyValidation = {
  createCompanySchema,
  updateCompanySchema,
  requestVerificationSchema
};



