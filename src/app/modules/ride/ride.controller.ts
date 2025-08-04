import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { rideService } from "./ride.service";
import { catchAsync } from "../../utils/catchAsync";


// 1. Rider requests a ride
 const requestRide = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

    const ride = await rideService.requestRide(payload);
    sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Ride Requested successfully",
            data: ride
        })
})

const getAllRides = catchAsync((async (req: Request, res: Response) => {
  const result = await rideService.getAllRides(req.query as Record<string, string>);
  sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Rides fetched successfully",
            ...result
        })
}))

const cancelRide = catchAsync(async (req: Request, res: Response) => {
  const { rideId } = req.params;

  const ride = await rideService.cancelRide(rideId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride Cancelled",
    data: ride,
  });
});


export const rideControllers = {
    requestRide,
    getAllRides,
    cancelRide
}