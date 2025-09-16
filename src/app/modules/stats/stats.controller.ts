import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatsService } from "./stats.service";

const getBookingStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsService.getBookingStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking stats fetched successfully",
    data: stats,
  });
});

const getPaymentStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsService.getPaymentStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment stats fetched successfully",
    data: stats,
  });
});

const getUserStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsService.getUserStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User stats fetched successfully",
    data: stats,
  });
});

const getRideStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsService.getRideStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Ride stats fetched successfully",
    data: stats,
  });
});

const getDriverStats = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.id;

  const stats = await StatsService.getDriverStats(driverId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Driver stats fetched successfully",
    data: stats,
  });
});



export const StatsController = {
  getBookingStats,
  getPaymentStats,
  getUserStats,
  getRideStats,
  getDriverStats
};