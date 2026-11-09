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

const deleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      isDeleted: true,
      isActive: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isDeleted: true,
      isActive: true,
    },
  });
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
      verificationRequests: {
        where: { status: "PENDING" },
        select: {
          id: true,
          website: true,
          contactEmail: true,
          note: true,
          createdAt: true,
        },
        take: 1,
        orderBy: { createdAt: "desc" },
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



const reviewVerification = async (
  id: string,
  adminId: string,
  payload: { status: "VERIFIED" | "REJECTED"; adminNote?: string }
) => {
  const request = await prisma.companyVerificationRequest.findUnique({
    where: { id: id },
  })

  if (!request) {
    throw new AppError(httpStatus.NOT_FOUND, "Verification request not found")
  }

  const [updatedRequest] = await prisma.$transaction([
    prisma.companyVerificationRequest.update({
      where: { id: id },
      data: {
        status: payload.status,
        adminNote: payload.adminNote,
        reviewedById: adminId,
      },
    }),
    prisma.company.update({
      where: { id: request.companyId },
      data: {
        verificationStatus: payload.status,
        verifiedAt: payload.status === "VERIFIED" ? new Date() : null,
      },
    }),
  ])

  return updatedRequest
}


export const AdminServices = {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllCompanies,
  reviewVerification,
};
  
