import { Ride } from "./ride.model";
import { IRide, RideStatus } from "./ride.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { rideSearchableFields } from "./ride.constant";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { FilterQuery } from "mongoose";
import { Driver } from "../driver/driver.model";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requestRide = async (payload: any) => {
  // 1. Create the ride
  const ride = await Ride.create(payload);

  // 2. Increment driver's totalRides
  if (payload.driverId) {
    await Driver.findByIdAndUpdate(payload.driverId, {
      $inc: { "driverProfile.totalRides": 1 },
    });
  }

  return ride;
};

const getAllRides = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder<IRide>(Ride.find(), query);

  const ridesData = queryBuilder
    .filter()
    .search(rideSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    ridesData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const cancelRide = async (rideId: string) => {
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }

  if (ride.status === "COMPLETED") {
    throw new AppError(httpStatus.BAD_REQUEST, "Completed ride cannot be cancelled");
  }

  if (ride.status === "CANCELLED") {
    throw new AppError(httpStatus.BAD_REQUEST, "Ride is already cancelled");
  }

  ride.status = RideStatus.CANCELLED;
  await ride.save();

  // update driver stats
  if (ride.driverId) {
    await Driver.findByIdAndUpdate(
      ride.driverId,
      {
        $inc: {
          "driverProfile.cancelAttempts": 1,
          "driverProfile.totalRides": -1, // decrement by 1
        },
      }
    );
  }

  return ride;
};

const getMyRideHistory = async (filter: FilterQuery<IRide>) => {
  const rides = await Ride.find(filter).select("pickupLocation dropoffLocation fare status createdAt")
    .populate("riderId", "name email phone role isActive locaton bookings")
    .populate("driverId", "name email phone role driverProfile")
    .sort({ createdAt: -1 });

  return rides;
};


export const rideService = {
  requestRide,
  getAllRides,
  cancelRide,
  getMyRideHistory
}
