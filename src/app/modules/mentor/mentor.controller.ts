import { NextFunction, Request, Response } from "express";
import CatchAsync from "../../shared/CatchAsync";
import { sendResponse } from "../../shared/sendResponse";
import httpStatus from "http-status";
import { MentorServices } from "./mentor.service";
import { IJwtPayload } from "./mentor.interface";

// ===================== MENTOR PROFILE =====================

const createMentorProfile = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IJwtPayload)?.id;
    const profile = await MentorServices.createMentorProfile(userId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Mentor Profile Created Successfully",
      data: profile,
    });
  }
);

const getMentorProfile = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const profile = await MentorServices.getMentorProfile(id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Mentor Profile Retrieved Successfully",
      data: profile,
    });
  }
);

const getMyMentorProfile = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IJwtPayload)?.id;
    const profile = await MentorServices.getMyMentorProfile(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "My Mentor Profile Retrieved Successfully",
      data: profile,
    });
  }
);

const updateMentorProfile = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IJwtPayload)?.id;
    const profile = await MentorServices.updateMentorProfile(userId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Mentor Profile Updated Successfully",
      data: profile,
    });
  }
);

const deleteMentorProfile = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IJwtPayload)?.id;
    const profile = await MentorServices.deleteMentorProfile(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Mentor Profile Deleted Successfully",
      data: profile,
    });
  }
);

// ===================== MENTOR AVAILABILITY =====================

const addAvailability = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IJwtPayload)?.id;
    const availability = await MentorServices.addAvailability(userId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Availability Slot Added Successfully",
      data: availability,
    });
  }
);

const getAvailability = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { mentorId } = req.params;
    const availability = await MentorServices.getAvailability(
      mentorId as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Availability Slots Retrieved Successfully",
      data: availability,
    });
  }
);

const updateAvailability = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IJwtPayload)?.id;
    const { slotId } = req.params;
    const availability = await MentorServices.updateAvailability(
      userId,
      slotId as string,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Availability Slot Updated Successfully",
      data: availability,
    });
  }
);

const deleteAvailability = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IJwtPayload)?.id;
    const { slotId } = req.params;
    const availability = await MentorServices.deleteAvailability(
      userId,
      slotId as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Availability Slot Deleted Successfully",
      data: availability,
    });
  }
);

// ===================== MENTOR SEARCH =====================

const searchMentors = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await MentorServices.searchMentors(req.query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Mentors Retrieved Successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

export const MentorControllers = {
  createMentorProfile,
  getMentorProfile,
  getMyMentorProfile,
  updateMentorProfile,
  deleteMentorProfile,
  addAvailability,
  getAvailability,
  updateAvailability,
  deleteAvailability,
  searchMentors,
};
