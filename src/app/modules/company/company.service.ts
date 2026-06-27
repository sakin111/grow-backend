

import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status";
import { ICreateCompanyPayload, IUpdateCompanyPayload } from "./company.interface";
import { QueryBuilder } from "../../shared/QueryBuilder";

const createCompany = async (ownerId: string, payload: ICreateCompanyPayload) => {

  const existingCompany = await prisma.company.findUnique({
    where: { ownerId },
  });

  if (existingCompany) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User already has a company"
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: ownerId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const company = await prisma.company.create({
    data: {
      ...payload,
      ownerId,
    },
    include: {
      owner: true,
    },
  });

  return company;
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
      _count: {
        select: { discussions: true, comments: true },
      },
    })
    .sort("-createdAt")
    .paginate()
    .fields();

  const data = await companyQuery.build();
  const meta = await companyQuery.getMeta();

  return { meta, data };
};


const getSingleCompany = async (companyId: string) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      discussions: true,
      comments: true,
    },
  });

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, "Company not found");
  }

  return company;
};

const updateCompany = async (
  companyId: string,
  ownerId: string,
  payload: IUpdateCompanyPayload
) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, "Company not found");
  }

  if (company.ownerId !== ownerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this company"
    );
  }

  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: payload,
    include: {
      owner: true,
    },
  });

  return updatedCompany;
};

const deleteCompany = async (companyId: string, ownerId: string) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, "Company not found");
  }

  if (company.ownerId !== ownerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this company"
    );
  }

  const deletedCompany = await prisma.company.delete({
    where: { id: companyId },
  });

  return deletedCompany;
};



const requestVerification = async (
  requestId: string,
  adminId: string,
  payload: { status: "VERIFIED" | "REJECTED"; adminNote?: string }
) => {
  const request = await prisma.companyVerificationRequest.findUnique({
    where: { id: requestId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      requestedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  if (!request) {
    throw new AppError(httpStatus.NOT_FOUND, "Verification request not found")
  }

  const [updatedRequest] = await prisma.$transaction([
    prisma.companyVerificationRequest.update({
      where: { id: requestId },
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

  return {
    ...updatedRequest,
    website: request.website,
    contactEmail: request.contactEmail,
    note: request.note,
    company: request.company,
    requestedBy: request.requestedBy,
  }
}

export const CompanyServices = {
  createCompany,
  getAllCompanies,
  getSingleCompany,
  updateCompany,
  deleteCompany,
  requestVerification
};