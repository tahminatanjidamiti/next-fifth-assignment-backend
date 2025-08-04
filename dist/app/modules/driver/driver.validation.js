"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDriverStatusZodSchema = exports.driverRegistrationZodSchema = exports.driverProfileZod = void 0;
const zod_1 = require("zod");
const user_interface_1 = require("../user/user.interface");
exports.driverProfileZod = zod_1.z.object({
    approved: zod_1.z.boolean().optional(),
    isOnline: zod_1.z.boolean().optional(),
    earnings: zod_1.z.number().optional(),
    rating: zod_1.z.number().optional(),
    totalRides: zod_1.z.number().optional(),
    cancelAttempts: zod_1.z.number().optional(),
    vehicleInfo: zod_1.z.object({
        type: zod_1.z.string({
            message: "Vehicle type is required"
        }),
        model: zod_1.z.string({
            message: "Vehicle model is required"
        }),
        licensePlate: zod_1.z.string({
            message: "License plate is required"
        })
    }),
});
exports.driverRegistrationZodSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." }).optional(),
    email: zod_1.z
        .string()
        .email({ message: "Invalid email address format." })
        .min(5, { message: "Email must be at least 5 characters long." })
        .max(100, { message: "Email cannot exceed 100 characters." }),
    phone: zod_1.z
        .string()
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
        .optional(),
    role: zod_1.z
        .enum(Object.values(user_interface_1.Role))
        .optional(),
    riderId: zod_1.z.string(),
    location: zod_1.z.object({
        type: zod_1.z.literal("Point").optional(),
        coordinates: zod_1.z
            .array(zod_1.z.number())
            .length(2, { message: "Coordinates must be [lng, lat]" }),
        formattedAddress: zod_1.z.string().optional(),
    }),
    driverProfile: exports.driverProfileZod,
});
exports.updateDriverStatusZodSchema = zod_1.z.object({
    isOnline: zod_1.z.boolean().optional(),
    approved: zod_1.z.boolean().optional(),
    earnings: zod_1.z.number().optional(),
    rating: zod_1.z.number().optional(),
    totalRides: zod_1.z.number().optional(),
    cancelAttempts: zod_1.z.number().optional(),
});
