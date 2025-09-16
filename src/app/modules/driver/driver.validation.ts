import { z } from "zod";
import { Role } from "../user/user.interface";


export const driverProfileZod = z.object({
  approved: z.boolean().optional(),
  isOnline: z.boolean().optional(),
  earnings: z.number().optional(),
  rating: z.number().optional(),
  totalRides: z.number().optional(),
  cancelAttempts: z.number().optional(),
  vehicleInfo: z.object({
    type: z.string({
      message: "Vehicle type is required"
    }),
    model: z.string({
      message: "Vehicle model is required"
    }),
    licensePlate: z.string({
      message: "License plate is required"
    })
  }),
});

export const driverRegistrationZodSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }).optional(),

  email: z
    .email()
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),

  phone: z
    .string()
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),
  role: z
    .enum(Object.values(Role) as [string])
    .optional(),
  riderId: z.string(),
  location: z.object({
    type: z.literal("Point").default("Point"),
    coordinates: z
      .array(z.number())
      .length(2, { message: "Coordinates must be [lng, lat]" }),
    formattedAddress: z.string().optional(),
  }),

  driverProfile: driverProfileZod,
});



export const updateDriverStatusZodSchema = z.object({
    isOnline: z.boolean().optional(),
    approved: z.boolean().optional(),
});