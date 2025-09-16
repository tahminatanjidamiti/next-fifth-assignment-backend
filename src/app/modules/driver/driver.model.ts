import { Schema, model } from "mongoose";
import { IDriver } from "./driver.interface";
import { defaultDriverProfile } from "./driver.constant";
import { Role } from "../user/user.interface";

export const driverProfileSchema = new Schema(
  {
    approved: { type: Boolean, default: defaultDriverProfile.approved },
    isOnline: { type: Boolean, default: defaultDriverProfile.isOnline },
    earnings: { type: Number, default: defaultDriverProfile.earnings },
    rating: { type: Number, default: defaultDriverProfile.rating },
    totalRides: { type: Number, default: defaultDriverProfile.totalRides },
    cancelAttempts: { type: Number, default: defaultDriverProfile.cancelAttempts },
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
  },
  { _id: false }
);


const driverSchema = new Schema<IDriver>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: {
            type: String,
            enum: Object.values(Role),
            default: Role.DRIVER
        },
    riderId: {
    type: Schema.Types.ObjectId,
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
    driverProfile: { type: driverProfileSchema, required: true },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

driverSchema.index({ location: "2dsphere" });

export const Driver = model<IDriver>("Driver", driverSchema);

