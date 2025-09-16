"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rideControllers = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const sendResponse_1 = require("../../utils/sendResponse");
const ride_service_1 = require("./ride.service");
const catchAsync_1 = require("../../utils/catchAsync");
const driver_model_1 = require("../driver/driver.model");
// 1. Rider requests a ride
const requestRide = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const ride = yield ride_service_1.rideService.requestRide(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Ride Requested successfully",
        data: ride
    });
}));
const getAllRides = (0, catchAsync_1.catchAsync)(((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield ride_service_1.rideService.getAllRides(req.query);
    (0, sendResponse_1.sendResponse)(res, Object.assign({ success: true, statusCode: http_status_codes_1.default.OK, message: "Rides fetched successfully" }, result));
})));
const cancelRide = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rideId } = req.params;
    const ride = yield ride_service_1.rideService.cancelRide(rideId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Ride Cancelled",
        data: ride,
    });
}));
const getMyRideHistory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const role = req.user.role;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = {};
    if (role === "RIDER") {
        query = { riderId: userId };
    }
    else if (role === "DRIVER") {
        const driverDoc = yield driver_model_1.Driver.findOne({ riderId: userId });
        if (!driverDoc) {
            return (0, sendResponse_1.sendResponse)(res, {
                statusCode: http_status_codes_1.default.NOT_FOUND,
                success: false,
                message: "Driver profile not found",
                data: [],
            });
        }
        query = { driverId: driverDoc._id };
    }
    const bookings = yield ride_service_1.rideService.getMyRideHistory(query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: bookings.length ? "Rides history retrieved successfully" : "You haven't make any ride yet!!",
        data: bookings,
    });
}));
exports.rideControllers = {
    requestRide,
    getAllRides,
    cancelRide,
    getMyRideHistory
};
