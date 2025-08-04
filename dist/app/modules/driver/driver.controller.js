"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const driver_service_1 = require("./driver.service");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const sendResponse_1 = require("../../utils/sendResponse");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const createDriver = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const newDriver = await driver_service_1.DriverService.createDriver(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Driver created successfully",
        data: newDriver,
    });
});
const getAllDrivers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await driver_service_1.DriverService.getAllDrivers(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
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
const getDriverByNear = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { lng, lat, radius } = req.query;
    // console.log("Raw query values:", { lng, lat, radius });
    if (!lat || !lng) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Latitude and longitude are required");
    }
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    let radiusKm = radius ? parseFloat(radius) : 5;
    // Validate lat/lng ranges
    if (isNaN(latitude) || latitude < -90 || latitude > 90 ||
        isNaN(longitude) || longitude < -180 || longitude > 180) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid latitude or longitude");
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
    const nearestDriver = await driver_service_1.DriverService.getDriverByNear(longitude, latitude, radiusMeters);
    // console.log("Parsed query values:", { lng: longitude, lat: latitude, radius: radiusMeters });
    if (!nearestDriver) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "No nearby driver found");
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Nearest driver found",
        data: nearestDriver,
    });
});
const getDriverById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const result = await driver_service_1.DriverService.getDriverById(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Driver Retrieved Successfully",
        data: result.data
    });
});
const updateDriverStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const role = req.user.role;
    const userId = req.user.id;
    if (role === 'DRIVER' && id !== userId) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Access denied.");
    }
    const updatedDriver = await driver_service_1.DriverService.updateDriverStatus(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Driver status updated successfully",
        data: updatedDriver,
    });
});
exports.DriverController = {
    createDriver,
    getAllDrivers,
    getDriverByNear,
    getDriverById,
    updateDriverStatus
};
