import { QueryBuilder } from "../../utils/QueryBuilder";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { driverSearchableFields } from "./driver.constant";
import { IDriver, IDriverProfile } from "./driver.interface";
import { Driver } from "./driver.model";

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

const getDriverById = async (id: string) => {
    const driver = await Driver.findById(id);
    return {
        data: driver
    }
};
export const DriverService = {
  createDriver,
  getAllDrivers,
  getDriverByNear,
  getDriverById,
  updateDriverStatus,
};


