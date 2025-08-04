"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rideControllers = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const sendResponse_1 = require("../../utils/sendResponse");
const ride_service_1 = require("./ride.service");
const catchAsync_1 = require("../../utils/catchAsync");
// 1. Rider requests a ride
const requestRide = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const ride = await ride_service_1.rideService.requestRide(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Ride Requested successfully",
        data: ride
    });
});
const getAllRides = (0, catchAsync_1.catchAsync)((async (req, res) => {
    const result = await ride_service_1.rideService.getAllRides(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Rides fetched successfully",
        ...result
    });
}));
const cancelRide = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { rideId } = req.params;
    const ride = await ride_service_1.rideService.cancelRide(rideId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Ride Cancelled",
        data: ride,
    });
});
const getMyRideHistory = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const bookings = await ride_service_1.rideService.getMyRideHistory(userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: bookings.length ? "Rides history retrieved successfully" : "You haven't make any ride yet!!",
        data: bookings,
    });
});
exports.rideControllers = {
    requestRide,
    getAllRides,
    cancelRide,
    getMyRideHistory
};
