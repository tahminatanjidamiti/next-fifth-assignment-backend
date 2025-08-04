import { Ride } from "./ride.model";
import { IRide, RideStatus } from "./ride.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { rideSearchableFields } from "./ride.constant";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requestRide = async (payload: any) => {
  return await Ride.create(payload);
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
  return ride;
};

export const rideService = {
    requestRide,
    getAllRides,
    cancelRide
}
