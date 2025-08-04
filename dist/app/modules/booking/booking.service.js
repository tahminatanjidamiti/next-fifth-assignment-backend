"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const payment_interface_1 = require("../payment/payment.interface");
const payment_model_1 = require("../payment/payment.model");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const user_model_1 = require("../user/user.model");
const booking_interface_1 = require("./booking.interface");
const booking_model_1 = require("./booking.model");
const getTransactionId_1 = require("../../utils/getTransactionId");
const ride_model_1 = require("../ride/ride.model");
const createRideBooking = async (payload) => {
    const transactionId = (0, getTransactionId_1.getTransactionId)();
    const session = await booking_model_1.RideBooking.startSession();
    session.startTransaction();
    try {
        const riderId = payload.rider;
        const rider = await user_model_1.User.findById(riderId);
        if (!rider?.phone || !rider.address) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Please update your profile to book a ride.");
        }
        const ride = await ride_model_1.Ride.findById(payload.ride).select("fare");
        if (!ride?.fare) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Ride fare not found!");
        }
        const amount = Number(ride.fare) * Number(payload.riderCount);
        const booking = await booking_model_1.RideBooking.create([{
                rider: riderId,
                status: booking_interface_1.BOOKING_STATUS.PENDING,
                ...payload
            }], { session });
        const payment = await payment_model_1.Payment.create([{
                booking: booking[0]._id,
                status: payment_interface_1.PAYMENT_STATUS.UNPAID,
                transactionId,
                amount,
            }], { session });
        const updatedBooking = await booking_model_1.RideBooking.findByIdAndUpdate(booking[0]._id, { payment: payment[0]._id }, { new: true, runValidators: true, session })
            .populate("rider", "name email phone address")
            .populate("ride", "title fare")
            .populate("payment");
        const sslPayload = {
            name: (updatedBooking?.rider).name,
            email: (updatedBooking?.rider).email,
            phoneNumber: (updatedBooking?.rider).phone,
            address: (updatedBooking?.rider).address,
            amount,
            transactionId,
        };
        const sslPayment = await sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
        await session.commitTransaction();
        session.endSession();
        return {
            paymentUrl: sslPayment.GatewayPageURL,
            booking: updatedBooking,
        };
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
const getUserBookings = async (userId) => {
    const bookings = await booking_model_1.RideBooking.find({ rider: userId })
        .populate("ride", "riderId driverId fare")
        .populate("payment")
        .sort({ createdAt: -1 });
    return bookings;
};
const getBookingById = async (bookingId) => {
    const booking = await booking_model_1.RideBooking.findById(bookingId)
        .populate("ride", "riderId driverId fare")
        .populate("payment")
        .populate("rider", "name email phone address");
    if (!booking) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    }
    return booking;
};
const updateBookingStatus = async (bookingId, newStatus) => {
    const updatedBooking = await booking_model_1.RideBooking.findByIdAndUpdate(bookingId, { status: newStatus }, { new: true, runValidators: true });
    if (!updatedBooking) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    }
    return updatedBooking;
};
const getAllBookings = async () => {
    const bookings = await booking_model_1.RideBooking.find()
        .populate("ride", "riderId driverId fare")
        .populate("rider", "name email")
        .populate("payment")
        .sort({ createdAt: -1 });
    return bookings;
};
exports.BookingService = {
    createRideBooking,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    getAllBookings,
};
