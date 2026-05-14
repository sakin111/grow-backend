import { NextFunction, Request, Response } from "express";
import CatchAsync from "../../shared/CatchAsync";
import { sendResponse } from "../../shared/sendResponse";
import httpStatus from "http-status";
import { SessionServices } from "./session.service";
import { IJwtPayload } from "./session.interface";


const createBooking = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = (req.user as IJwtPayload)?.id;
    const booking = await SessionServices.createBooking(ownerId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Booking Created Successfully",
      data: booking,
    });
  }
);

const confirmBooking = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const mentorUserId = (req.user as IJwtPayload)?.id;
    const { bookingId } = req.params;
    const booking = await SessionServices.confirmBooking(
      mentorUserId,
      bookingId as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Booking Confirmed Successfully",
      data: booking,
    });
  }
);

const cancelBooking = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IJwtPayload)?.id;
    const { bookingId } = req.params;
    const booking = await SessionServices.cancelBooking(
      userId,
      bookingId as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Booking Cancelled Successfully",
      data: booking,
    });
  }
);

const completeBooking = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const mentorUserId = (req.user as IJwtPayload)?.id;
    const { bookingId } = req.params;
    const booking = await SessionServices.completeBooking(
      mentorUserId,
      bookingId as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Booking Completed Successfully",
      data: booking,
    });
  }
);

const getMyBookings = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IJwtPayload;
    const result = await SessionServices.getMyBookings(
      user.id,
      user.role,
      req.query
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Bookings Retrieved Successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getSingleBooking = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IJwtPayload)?.id;
    const { bookingId } = req.params;
    const booking = await SessionServices.getSingleBooking(
      userId,
      bookingId as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Booking Retrieved Successfully",
      data: booking,
    });
  }
);

const getAllBookings = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await SessionServices.getAllBookings(req.query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Bookings Retrieved Successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const startSession = CatchAsync(
  async (req: Request, res: Response) => {
    const mentorUserId = (req.user as IJwtPayload)?.id;
    const { id: bookingId } = req.params;
    const result = await SessionServices.startSession(mentorUserId, bookingId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Session Started Successfully",
      data: result,
    });
  }
);

const joinSession = CatchAsync(
  async (req: Request, res: Response) => {
    const userId = (req.user as IJwtPayload)?.id;
    const { id: bookingId } = req.params;
    const result = await SessionServices.joinSession(userId, bookingId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Session Joined Successfully",
      data: result,
    });
  }
);

const endSession = CatchAsync(
  async (req: Request, res: Response) => {
    const mentorUserId = (req.user as IJwtPayload)?.id;
    const { id: bookingId } = req.params;
    const result = await SessionServices.endSession(mentorUserId, bookingId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Session Ended Successfully",
      data: result,
    });
  }
);

export const SessionControllers = {
  createBooking,
  confirmBooking,
  cancelBooking,
  completeBooking,
  getMyBookings,
  getSingleBooking,
  getAllBookings,
  startSession,
  joinSession,
  endSession,
};

