"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RideBooking = void 0;
const mongoose_1 = require("mongoose");
const booking_interface_1 = require("./booking.interface");
const rideBookingSchema = new mongoose_1.Schema({
    rider: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    driver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Driver",
        required: true,
    },
    ride: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Ride",
        required: true,
    },
    payment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Payment",
    },
    riderCount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(booking_interface_1.BOOKING_STATUS),
        default: booking_interface_1.BOOKING_STATUS.PENDING,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.RideBooking = (0, mongoose_1.model)("RideBooking", rideBookingSchema);
