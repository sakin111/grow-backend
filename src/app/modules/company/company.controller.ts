import { NextFunction, Request, Response } from "express"
import CatchAsync from "../../shared/CatchAsync"
import { sendResponse } from "../../shared/sendResponse"
import httpStatus from "http-status";
import { CompanyServices } from "./company.service";
import { IJwtPayload } from "./company.interface";


const createCompany = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = (req.user as IJwtPayload)?.id
    const company = await CompanyServices.createCompany(ownerId, req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Company Created Successfully",
        data: company,
    })
})

const getAllCompanies = CatchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const result = await CompanyServices.getAllCompanies(page, limit);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Companies Retrieved Successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleCompany = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const company = await CompanyServices.getSingleCompany(id as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Company Retrieved Successfully",
        data: company,
    })
})

const updateCompany = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const ownerId = (req.user as IJwtPayload)?.id
    const company = await CompanyServices.updateCompany(id as string, ownerId, req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Company Updated Successfully",
        data: company,
    })
})

const deleteCompany = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const ownerId = (req.user as IJwtPayload)?.id;
    const company = await CompanyServices.deleteCompany(id as string, ownerId)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Company Deleted Successfully",
        data: company,
    })
})


export const CompanyControllers = {
    createCompany,
    getAllCompanies,
    getSingleCompany,
    updateCompany,
    deleteCompany,
}