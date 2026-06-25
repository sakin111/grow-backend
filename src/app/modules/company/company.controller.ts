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
  const result = await CompanyServices.getAllCompanies(req.query);

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

  const payload: any = { ...req.body };
  if (req.file) {
    const file: any = req.file;
    const url = file.path || file.secure_url || file.location || file.url;
    if (url) payload.logo = url;
  }

  const company = await CompanyServices.updateCompany(id as string, ownerId, payload)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Company Updated Successfully",
    data: company,
  })
})


const requestVerification = CatchAsync(async (req: Request, res: Response) => {
  const companyId = req.params.id as string;
  const ownerId = (req.user as IJwtPayload)?.id;



  const result = await CompanyServices.requestVerification(
    companyId,
    ownerId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Verification request sent",
    data: result,
  });
});

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
    requestVerification
}