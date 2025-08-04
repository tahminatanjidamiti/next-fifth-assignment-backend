"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const stats_service_1 = require("./stats.service");
const getBookingStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await stats_service_1.StatsService.getBookingStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Booking stats fetched successfully",
        data: stats,
    });
});
const getPaymentStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await stats_service_1.StatsService.getPaymentStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Payment stats fetched successfully",
        data: stats,
    });
});
const getUserStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await stats_service_1.StatsService.getUserStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "User stats fetched successfully",
        data: stats,
    });
});
const getRideStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await stats_service_1.StatsService.getRideStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Ride stats fetched successfully",
        data: stats,
    });
});
const getDriverStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const driverId = req.user.id;
    const stats = await stats_service_1.StatsService.getDriverStats(driverId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Driver stats fetched successfully",
        data: stats,
    });
});
exports.StatsController = {
    getBookingStats,
    getPaymentStats,
    getUserStats,
    getRideStats,
    getDriverStats
};
