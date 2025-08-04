import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { DriverService } from "./driver.service";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";

const createDriver = catchAsync(async (req: Request, res: Response) => {
  const newDriver = await DriverService.createDriver(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Driver created successfully",
    data: newDriver,
  });
});

const getAllDrivers = catchAsync(async (req: Request, res: Response) => {
  const result = await DriverService.getAllDrivers(req.query as Record<string, string>);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All drivers retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});
// const getDriverByNear = catchAsync(async (req: Request, res: Response) => {
//   const { lng, lat, radius } = req.query;
// console.log("Raw query values:", { lng, lat, radius });
//   if (!lat || !lng) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Latitude and longitude are required");
//   }

//   const nearestDriver = await DriverService.getDriverByNear(
//     parseFloat(lng as string),
//     parseFloat(lat as string),
//     radius ? parseFloat(radius as string) * 1000 : 5000
//   );
//   console.log("parse query values:", { lng, lat, radius });

//   if (!nearestDriver) {
//     throw new AppError(httpStatus.NOT_FOUND, "No nearby driver found");
//   }

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Nearest driver found",
//     data: nearestDriver,
//   });
// });

const getDriverByNear = catchAsync(async (req: Request, res: Response) => {
  const { lng, lat, radius } = req.query;

  // console.log("Raw query values:", { lng, lat, radius });

  if (!lat || !lng) {
    throw new AppError(httpStatus.BAD_REQUEST, "Latitude and longitude are required");
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);
  let radiusKm = radius ? parseFloat(radius as string) : 5;

  // Validate lat/lng ranges
  if (
    isNaN(latitude) || latitude < -90 || latitude > 90 ||
    isNaN(longitude) || longitude < -180 || longitude > 180
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid latitude or longitude");
  }

  // Validate and limit radius
  const MAX_RADIUS_METERS = 100000; // 100 km
  if (isNaN(radiusKm) || radiusKm <= 0) {
    radiusKm = 5;
  }
  if (radiusKm * 1000 > MAX_RADIUS_METERS) {
    radiusKm = MAX_RADIUS_METERS / 1000;
  }
  const radiusMeters = radiusKm * 1000;

  const nearestDriver = await DriverService.getDriverByNear(
    longitude,
    latitude,
    radiusMeters
  );

  // console.log("Parsed query values:", { lng: longitude, lat: latitude, radius: radiusMeters });

  if (!nearestDriver) {
    throw new AppError(httpStatus.NOT_FOUND, "No nearby driver found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Nearest driver found",
    data: nearestDriver,
  });
});

const getDriverById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await DriverService.getDriverById(id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Driver Retrieved Successfully",
        data: result.data
    })
})

const updateDriverStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const role = req.user.role;
  const userId = req.user.id;

  if (role === 'DRIVER' && id !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied.");
  }

  const updatedDriver = await DriverService.updateDriverStatus(id, req.body);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Driver status updated successfully",
    data: updatedDriver,
  });
});


export const DriverController = {
  createDriver,
  getAllDrivers,
  getDriverByNear,
  getDriverById,
  updateDriverStatus
};
