"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const booking_interface_1 = require("../booking/booking.interface");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const payment_interface_1 = require("./payment.interface");
const payment_model_1 = require("./payment.model");
const sendEmail_1 = require("../../utils/sendEmail");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const invoice_1 = require("../../utils/invoice");
const booking_model_1 = require("../booking/booking.model");
const ride_model_1 = require("../ride/ride.model");
const initPayment = async (bookingId) => {
    const payment = await payment_model_1.Payment.findOne({ booking: bookingId });
    if (!payment) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Payment Not Found. You have not booked this ride");
    }
    const booking = await booking_model_1.RideBooking.findById(payment.booking);
    const userAddress = (booking?.rider).address;
    const userEmail = (booking?.rider).email;
    const userPhoneNumber = (booking?.rider).phone;
    const userName = (booking?.rider).name;
    const sslPayload = {
        address: userAddress,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        name: userName,
        amount: payment.amount,
        transactionId: payment.transactionId
    };
    const sslPayment = await sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
    return {
        paymentUrl: sslPayment.GatewayPageURL
    };
};
const successPayment = async (query) => {
    const session = await booking_model_1.RideBooking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = await payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.PAID,
        }, { new: true, runValidators: true, session: session });
        if (!updatedPayment) {
            throw new AppError_1.default(401, "Payment not found");
        }
        const updatedBooking = await booking_model_1.RideBooking
            .findByIdAndUpdate(updatedPayment?.booking, { status: booking_interface_1.BOOKING_STATUS.COMPLETE }, { new: true, runValidators: true, session })
            .populate("ride", "riderId driverId")
            .populate("rider", "name email");
        if (!updatedBooking) {
            throw new AppError_1.default(401, "Booking not found");
        }
        await ride_model_1.Ride.findByIdAndUpdate(updatedBooking.ride?._id, { status: "COMPLETED" }, // or use RideStatus.COMPLETED if you have enum
        { session });
        const invoiceData = {
            bookingDate: updatedBooking.createdAt,
            riderCount: updatedBooking.riderCount,
            riderId: updatedBooking.ride.riderId,
            driverId: updatedBooking.ride.driverId,
            totalAmount: updatedPayment.amount,
            transactionId: updatedPayment.transactionId,
            userName: updatedBooking.rider.name
        };
        const pdfBuffer = await (0, invoice_1.generatePdf)(invoiceData);
        const cloudinaryResult = await (0, cloudinary_config_1.uploadBufferToCloudinary)(pdfBuffer, "invoice");
        if (!cloudinaryResult) {
            throw new AppError_1.default(401, "Error uploading pdf");
        }
        await payment_model_1.Payment.findByIdAndUpdate(updatedPayment._id, { invoiceUrl: cloudinaryResult.secure_url }, { runValidators: true, session });
        await (0, sendEmail_1.sendEmail)({
            to: updatedBooking.rider.email,
            subject: "Your Booking Invoice",
            templateName: "invoice",
            templateData: invoiceData,
            attachments: [
                {
                    filename: "invoice.pdf",
                    content: pdfBuffer,
                    contentType: "application/pdf"
                }
            ]
        });
        await session.commitTransaction(); //transaction
        session.endSession();
        return { success: true, message: "Payment Completed Successfully" };
    }
    catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession();
        throw error;
    }
};
const failPayment = async (query) => {
    const session = await booking_model_1.RideBooking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = await payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.FAILED,
        }, { new: true, runValidators: true, session: session });
        await booking_model_1.RideBooking
            .findByIdAndUpdate(updatedPayment?.booking, { status: booking_interface_1.BOOKING_STATUS.FAILED }, { runValidators: true, session });
        await session.commitTransaction(); //transaction
        session.endSession();
        return { success: false, message: "Payment Failed" };
    }
    catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession();
        throw error;
    }
};
const cancelPayment = async (query) => {
    const session = await booking_model_1.RideBooking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = await payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.CANCELLED,
        }, { runValidators: true, session: session });
        await booking_model_1.RideBooking
            .findByIdAndUpdate(updatedPayment?.booking, { status: booking_interface_1.BOOKING_STATUS.CANCEL }, { runValidators: true, session });
        await session.commitTransaction(); //transaction
        session.endSession();
        return { success: false, message: "Payment Cancelled" };
    }
    catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession();
        throw error;
    }
};
const getInvoiceDownloadUrl = async (paymentId) => {
    const payment = await payment_model_1.Payment.findById(paymentId)
        .select("invoiceUrl");
    if (!payment) {
        throw new AppError_1.default(401, "Payment not found");
    }
    if (!payment.invoiceUrl) {
        throw new AppError_1.default(401, "No invoice found");
    }
    return payment.invoiceUrl;
};
exports.PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceDownloadUrl
};
