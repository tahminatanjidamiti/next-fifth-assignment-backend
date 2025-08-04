"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRideZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const ride_interface_1 = require("./ride.interface");
exports.createRideZodSchema = zod_1.default.object({
    riderId: zod_1.default.string({ message: "Rider ID is required" }),
    driverId: zod_1.default.string({ message: "Driver ID is required" }),
    pickupLocation: zod_1.default.object({
        lat: zod_1.default.number({ message: "Pickup latitude is required" }),
        lng: zod_1.default.number({ message: "Pickup longitude is required" }),
        formattedAddress: zod_1.default.string().optional(),
    }),
    dropoffLocation: zod_1.default.object({
        lat: zod_1.default.number({ message: "Dropoff latitude is required" }),
        lng: zod_1.default.number({ message: "Dropoff longitude is required" }),
        formattedAddress: zod_1.default.string().optional(),
    }),
    status: zod_1.default
        .enum(Object.values(ride_interface_1.RideStatus))
        .optional(),
    fare: zod_1.default.number().min(0).optional(),
    distanceKm: zod_1.default.number().min(0).optional(),
    estimatedTime: zod_1.default.number().min(0).optional(),
});
