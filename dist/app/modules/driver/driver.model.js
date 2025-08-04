"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Driver = exports.driverProfileSchema = void 0;
const mongoose_1 = require("mongoose");
const driver_constant_1 = require("./driver.constant");
const user_interface_1 = require("../user/user.interface");
exports.driverProfileSchema = new mongoose_1.Schema({
    approved: { type: Boolean, default: driver_constant_1.defaultDriverProfile.approved },
    isOnline: { type: Boolean, default: driver_constant_1.defaultDriverProfile.isOnline },
    earnings: { type: Number, default: driver_constant_1.defaultDriverProfile.earnings },
    rating: { type: Number, default: driver_constant_1.defaultDriverProfile.rating },
    totalRides: { type: Number, default: driver_constant_1.defaultDriverProfile.totalRides },
    cancelAttempts: { type: Number, default: driver_constant_1.defaultDriverProfile.cancelAttempts },
    vehicleInfo: {
        type: {
            type: String,
            required: true,
        },
        model: {
            type: String,
            required: true,
        },
        licensePlate: {
            type: String,
            required: true,
        },
    },
}, { _id: false });
const driverSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        default: user_interface_1.Role.DRIVER
    },
    riderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
        formattedAddress: {
            type: String
        }
    },
    driverProfile: { type: exports.driverProfileSchema, required: true },
}, {
    timestamps: true,
    versionKey: false
});
driverSchema.index({ location: "2dsphere" });
exports.Driver = (0, mongoose_1.model)("Driver", driverSchema);
