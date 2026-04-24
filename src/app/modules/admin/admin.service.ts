import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status";
import { UserStatus, VerificationStatus } from "@prisma/client";

const getAllUsers = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  const total = await prisma.user.count();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: users,
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

const getAllCompanies = async (status?: VerificationStatus) => {
  const companies = await prisma.company.findMany({
    where: status ? { verificationStatus: status } : {},
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return companies;
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
