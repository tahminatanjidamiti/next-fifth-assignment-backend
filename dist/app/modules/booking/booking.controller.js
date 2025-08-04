"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const booking_service_1 = require("./booking.service");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// import AppError from "../../errorHelpers/AppError";
const createBooking = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const booking = await booking_service_1.BookingService.createRideBooking(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Booking created successfully",
        data: booking,
    });
});
const getUserBookings = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const bookings = await booking_service_1.BookingService.getUserBookings(userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: bookings.length ? "Bookings retrieved successfully" : "You haven't make any booking yet!!",
        data: bookings,
    });
});
const getSingleBooking = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const bookingId = req.params.bookingId;
    const booking = await booking_service_1.BookingService.getBookingById(bookingId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Booking retrieved successfully",
        data: booking,
    });
});
const getAllBookings = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const bookings = await booking_service_1.BookingService.getAllBookings();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings,
    });
});
const updateBookingStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const bookingId = req.params.bookingId;
    const { status } = req.body; // validated by your zod schema
    const updated = await booking_service_1.BookingService.updateBookingStatus(bookingId, status);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Booking Status Updated Successfully",
        data: updated,
    });
});
exports.BookingController = {
    createBooking,
    getAllBookings,
    getSingleBooking,
    getUserBookings,
    updateBookingStatus,
};
