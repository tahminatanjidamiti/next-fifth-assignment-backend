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
const createRideBooking = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = (0, getTransactionId_1.getTransactionId)();
    const session = yield booking_model_1.RideBooking.startSession();
    session.startTransaction();
    try {
        const riderId = payload.rider;
        const rider = yield user_model_1.User.findById(riderId);
        if (!(rider === null || rider === void 0 ? void 0 : rider.phone) || !rider.address) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Please update your profile to book a ride.");
        }
        const ride = yield ride_model_1.Ride.findById(payload.ride).select("fare");
        if (!(ride === null || ride === void 0 ? void 0 : ride.fare)) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Ride fare not found!");
        }
        const amount = Number(ride.fare) * Number(payload.riderCount);
        const booking = yield booking_model_1.RideBooking.create([Object.assign({ rider: riderId, status: booking_interface_1.BOOKING_STATUS.PENDING }, payload)], { session });
        const payment = yield payment_model_1.Payment.create([{
                booking: booking[0]._id,
                status: payment_interface_1.PAYMENT_STATUS.UNPAID,
                transactionId,
                amount,
            }], { session });
        const updatedBooking = yield booking_model_1.RideBooking.findByIdAndUpdate(booking[0]._id, { payment: payment[0]._id }, { new: true, runValidators: true, session })
            .populate("rider", "name email phone address")
            .populate("ride", "title fare")
            .populate("payment");
        const sslPayload = {
            name: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.rider).name,
            email: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.rider).email,
            phoneNumber: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.rider).phone,
            address: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.rider).address,
            amount,
            transactionId,
        };
        const sslPayment = yield sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
        yield session.commitTransaction();
        session.endSession();
        return {
            paymentUrl: sslPayment.GatewayPageURL,
            booking: updatedBooking,
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getUserBookings = (filter) => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = yield booking_model_1.RideBooking.find(filter)
        .populate("ride", "riderId driverId fare pickupLocation dropoffLocation")
        .populate("driver", "name email")
        .populate("rider", "name email")
        .populate("payment")
        .sort({ createdAt: -1 });
    return bookings;
});
const getBookingById = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_model_1.RideBooking.findById(bookingId)
        .populate("ride", "riderId driverId fare")
        .populate("payment")
        .populate("rider", "name email phone address")
        .populate("driver", "name email phone address");
    if (!booking) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    }
    return booking;
});
const updateBookingStatus = (bookingId, newStatus) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedBooking = yield booking_model_1.RideBooking.findByIdAndUpdate(bookingId, { status: newStatus }, { new: true, runValidators: true });
    if (!updatedBooking) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    }
    return updatedBooking;
});
const getAllBookings = () => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = yield booking_model_1.RideBooking.find()
        .populate("ride", "riderId driverId fare")
        .populate("rider", "name email")
        .populate("payment")
        .sort({ createdAt: -1 });
    return bookings;
});
exports.BookingService = {
    createRideBooking,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    getAllBookings,
};
