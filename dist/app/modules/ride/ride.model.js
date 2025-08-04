"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ride = void 0;
const mongoose_1 = require("mongoose");
const ride_interface_1 = require("./ride.interface");
const rideSchema = new mongoose_1.Schema({
    riderId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    driverId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Driver" },
    pickupLocation: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        formattedAddress: { type: String },
    },
    dropoffLocation: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        formattedAddress: { type: String },
    },
    status: {
        type: String,
        enum: Object.values(ride_interface_1.RideStatus),
        default: ride_interface_1.RideStatus.REQUESTED,
    },
    fare: { type: Number, default: 0 },
    distanceKm: Number,
    estimatedTime: Number,
}, {
    timestamps: true,
    versionKey: false
});
exports.Ride = (0, mongoose_1.model)("Ride", rideSchema);
