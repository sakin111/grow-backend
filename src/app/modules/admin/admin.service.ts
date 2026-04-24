import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status";
import { UserStatus, VerificationStatus } from "@prisma/client";
import { QueryBuilder } from "../../shared/QueryBuilder";

const getAllUsers = async (query: Record<string, any>) => {
  const userQuery = new QueryBuilder(prisma.user, query)
    .search(["name", "email"])
    .filter()
    .sort("-createdAt")
    .paginate()
    .fields();

  const data = await userQuery.build();
  const meta = await userQuery.getMeta();

  return {
    meta,
    data,
  };
};

const updateUserStatus = async (userId: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  return updatedUser;
};

const getAllCompanies = async (query: Record<string, any>) => {
  const companyQuery = new QueryBuilder(prisma.company, query)
    .search(["name", "description"])
    .filter()
    .relation({
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    })
    .sort("-createdAt")
    .paginate()
    .fields();

  const data = await companyQuery.build();
  const meta = await companyQuery.getMeta();

  return {
    meta,
    data,
  };
};

const verifyCompany = async (companyId: string, status: VerificationStatus) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, "Company not found");
  }

  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: {
      verificationStatus: status,
      verifiedAt: status === VerificationStatus.VERIFIED ? new Date() : null,
    },
  });

  return updatedCompany;
};

export const AdminServices = {
  getAllUsers,
  updateUserStatus,
  getAllCompanies,
  verifyCompany,
};
