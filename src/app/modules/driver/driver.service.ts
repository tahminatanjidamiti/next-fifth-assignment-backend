import mongoose from "mongoose";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { driverSearchableFields } from "./driver.constant";
import { IDriver, IDriverProfile } from "./driver.interface";
import { Driver } from "./driver.model";
import { Ride } from "../ride/ride.model";

const createDriver = async (payload: IDriver): Promise<IDriver> => {
  const driver = await Driver.create(payload);
  return driver;
};

const getAllDrivers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder<IDriver>(Driver.find({ role: "DRIVER" }), query);

  const driversData = queryBuilder
    .filter()
    .search(driverSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    driversData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};


const getDriverByNear = async (
  lng: number,
  lat: number,
  radius: number
): Promise<IDriver | null> => {
  // console.log("Service query values:", { lng, lat, radius });

  return await Driver.findOne({
    role: "DRIVER",
    "driverProfile.isOnline": true,
    "driverProfile.approved": true,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat], // [longitude, latitude]
        },
        $maxDistance: radius, // meters
      },
    },
  }).sort({ "driverProfile.rating": -1 });
};


const updateDriverStatus = async (
  id: string,
  payload: Partial<IDriverProfile>
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFields: any = {};

  if (payload.isOnline !== undefined)
    updateFields["driverProfile.isOnline"] = payload.isOnline;

  if (payload.approved !== undefined)
    updateFields["driverProfile.approved"] = payload.approved;

  const updatedDriver = await Driver.findOneAndUpdate(
    { _id: id },
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  // If approved, update user's role to DRIVER
  if (payload.approved === true && updatedDriver?.riderId) {
    await User.findByIdAndUpdate(
      updatedDriver.riderId,
      { role: Role.DRIVER },
      { new: true }
    );
  }

  return updatedDriver;
}
const getDriverStatsMe = async (driverId: string) => {
  const objectId = new mongoose.Types.ObjectId(driverId);

  // ----------- Daily Earnings -----------
  const dailyEarnings = await Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.PAID } },
    {
      $lookup: {
        from: "ridebookings",
        localField: "booking",
        foreignField: "_id",
        as: "bookingData",
      },
    },
    { $unwind: "$bookingData" },
    { $match: { "bookingData.driver": objectId } },
    {
      $group: {
        _id: { day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.day": 1 } },
  ]);

  // ----------- Weekly Earnings -----------
  const weeklyEarnings = await Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.PAID } },
    {
      $lookup: {
        from: "ridebookings",
        localField: "booking",
        foreignField: "_id",
        as: "bookingData",
      },
    },
    { $unwind: "$bookingData" },
    { $match: { "bookingData.driver": objectId } },
    {
      $group: {
        _id: {
          week: { $isoWeek: "$createdAt" },
          year: { $isoWeekYear: "$createdAt" },
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.week": 1 } },
  ]);

  // ----------- Monthly Earnings -----------
  const monthlyEarnings = await Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.PAID } },
    {
      $lookup: {
        from: "ridebookings",
        localField: "booking",
        foreignField: "_id",
        as: "bookingData",
      },
    },
    { $unwind: "$bookingData" },
    { $match: { "bookingData.driver": objectId } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // ----------- Totals (earnings + rides) -----------
  const totalStats = await Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.PAID } },
    {
      $lookup: {
        from: "ridebookings",
        localField: "booking",
        foreignField: "_id",
        as: "bookingData",
      },
    },
    { $unwind: "$bookingData" },
    { $match: { "bookingData.driver": objectId } },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: "$amount" },
        totalRides: { $sum: 1 },
      },
    },
  ]);

  // ----------- Completed Rides Count -----------
  const completedRides = await Ride.countDocuments({
    driverId: objectId,
    status: "COMPLETED",
  });

  return {
    totalEarnings: totalStats[0]?.totalEarnings || 0,
    totalRides: totalStats[0]?.totalRides || 0,
    completedRides,
    charts: {
      daily: dailyEarnings.map((d) => ({ date: d._id.day, earnings: d.total })),
      weekly: weeklyEarnings.map((w) => ({
        week: `${w._id.year}-W${w._id.week}`,
        earnings: w.total,
      })),
      monthly: monthlyEarnings.map((m) => ({
        month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
        earnings: m.total,
      })),
    },
  };
};
const getDriverMe = async (id: string) => {
    const driver = await Driver.findById(id);
    return {
        data: driver
    }
};
export const DriverService = {
  createDriver,
  getAllDrivers,
  getDriverByNear,
  getDriverMe,
  getDriverStatsMe,
  updateDriverStatus,
};


