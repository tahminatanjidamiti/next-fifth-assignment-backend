import { model, Schema } from "mongoose";
import { BOOKING_STATUS, IRideBooking } from "./booking.interface";

const rideBookingSchema = new Schema<IRideBooking>({
  rider : {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  driver : {
    type: Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  ride: {
    type: Schema.Types.ObjectId,
    ref: "Ride",
    required: true,
  },
  payment: {
    type: Schema.Types.ObjectId,
    ref: "Payment",
  },
  riderCount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(BOOKING_STATUS),
    default: BOOKING_STATUS.PENDING,
  },
},
{
  timestamps: true,
  versionKey: false,
});

export const RideBooking = model<IRideBooking>("RideBooking", rideBookingSchema);