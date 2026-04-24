import { UserStatus, VerificationStatus } from "@prisma/client";

export interface IUserStatusUpdate {
  status: UserStatus;
}

export interface ICompanyVerificationUpdate {
  status: VerificationStatus;
}
