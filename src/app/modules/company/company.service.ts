

import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status";
import { ICreateCompanyPayload, IUpdateCompanyPayload } from "./company.interface";

const createCompany = async (ownerId: string, payload: ICreateCompanyPayload) => {
  // Check if user already has a company
  const existingCompany = await prisma.company.findUnique({
    where: { ownerId },
  });

  if (existingCompany) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User already has a company"
    );
  }

  // Check if user exists
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

const getAllCompanies = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      skip,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { discussions: true, comments: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.company.count(),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: companies,
  };
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

export const CompanyServices = {
  createCompany,
  getAllCompanies,
  getSingleCompany,
  updateCompany,
  deleteCompany,
};