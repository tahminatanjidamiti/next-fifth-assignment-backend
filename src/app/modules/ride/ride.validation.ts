import z from "zod";
import { RideStatus } from "./ride.interface";

export const createRideZodSchema = z.object({
  riderId: z.string({ message: "Rider ID is required" }),

  driverId: z.string({ message: "Driver ID is required" }),

  pickupLocation: z.object({
    lat: z.number({ message: "Pickup latitude is required" }),
    lng: z.number({ message: "Pickup longitude is required" }),
    formattedAddress: z.string().optional(),
  }),

  dropoffLocation: z.object({
    lat: z.number({ message: "Dropoff latitude is required" }),
    lng: z.number({ message: "Dropoff longitude is required" }),
    formattedAddress: z.string().optional(),
  }),

  status: z
    .enum(Object.values(RideStatus) as [string])
    .optional(),

  fare: z.number().min(0),

  distanceKm: z.number().min(0).optional(),

  estimatedTime: z.number().min(0).optional(),

});