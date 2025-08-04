import { Schema, model } from "mongoose";
import { RideStatus } from "./ride.interface";

const rideSchema = new Schema({
  riderId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  driverId: { type: Schema.Types.ObjectId, required: true, ref: "Driver" },
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
    enum: Object.values(RideStatus),
    default: RideStatus.REQUESTED,
  },
  fare: { type: Number, default: 0 },
  distanceKm: Number,
  estimatedTime: Number,
}, {
  timestamps: true,
  versionKey: false
});

export const Ride = model("Ride", rideSchema);