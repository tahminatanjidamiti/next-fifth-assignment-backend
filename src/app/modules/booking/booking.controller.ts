import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BookingService } from "./booking.service";
import httpStatus from "http-status-codes";
import { Driver } from "../driver/driver.model";
import { JwtPayload } from "jsonwebtoken";
// import AppError from "../../errorHelpers/AppError";


const createBooking = catchAsync(async (req: Request, res: Response) => {
    const booking = await BookingService.createRideBooking(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Booking created successfully",
        data: booking,
    });
});

const getUserBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload).userId;
    const role = req.user.role;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: Record<string, any> = {};

    if (role === "RIDER") {
      query = { rider: userId };
    } else if (role === "DRIVER") {
      const driverDoc = await Driver.findOne({ riderId: userId });
      if (!driverDoc) {
      return sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: "Driver profile not found",
        data: [],
      });
    }
      query = { driver: driverDoc._id };
    }
  const bookings = await BookingService.getUserBookings(query);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message:  bookings.length ? "Bookings retrieved successfully" : "You haven't make any booking yet!!",
    data: bookings,
  });
});

const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const bookingId = req.params.bookingId;
  const booking = await BookingService.getBookingById(bookingId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking retrieved successfully",
    data: booking,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const bookings = await BookingService.getAllBookings();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bookings retrieved successfully",
    data: bookings,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const bookingId = req.params.bookingId;
  const { status } = req.body; // validated by your zod schema

  const updated = await BookingService.updateBookingStatus(bookingId, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking Status Updated Successfully",
    data: updated,
  });
});

export const BookingController = {
    createBooking,
    getAllBookings,
    getSingleBooking,
    getUserBookings,
    updateBookingStatus,
}