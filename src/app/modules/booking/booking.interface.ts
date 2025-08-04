import { Types } from "mongoose";

export enum BOOKING_STATUS {
  PENDING = "PENDING",
  CANCEL = "CANCEL",
  COMPLETE = "COMPLETE",
  FAILED = "FAILED",
}

export interface IRideBooking {
  rider: Types.ObjectId;
  driver: Types.ObjectId;
  ride: Types.ObjectId;
  payment?: Types.ObjectId;
  riderCount: number;
  status: BOOKING_STATUS;
  createdAt?: Date;
}