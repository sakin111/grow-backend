import { VerificationStatus } from "@prisma/client";

export interface ICompany {
  id: string;
  name: string;
  industry: string;
  size: string;
  stage: string;
  description: string;
  ownerId: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCompanyPayload {
  name: string;
  industry: string;
  size: string;
  stage: string;
  description: string;
}

export interface IUpdateCompanyPayload {
  name?: string;
  industry?: string;
  size?: string;
  stage?: string;
  description?: string;
  verificationStatus?: VerificationStatus;
}

export interface IJwtPayload {
  id: string;
  email: string;
  role: string;
}
