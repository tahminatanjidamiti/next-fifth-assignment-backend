import { Types } from "mongoose";
import { Role } from "../user/user.interface";


export interface IVehicleInfo {
  type: string; 
  model: string;
  licensePlate: string;
}

export interface IDriverProfile {
  approved: boolean;
  isOnline: boolean;
  vehicleInfo: IVehicleInfo;
  earnings: number;
  rating: number;
  totalRides: number;
  cancelAttempts: number;
}

export interface IGeoLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
  formattedAddress?: string;
}

export interface IDriver {
  name: string;
  email: string;
  phone: string;
  role: Role;
  riderId: Types.ObjectId;
  location: IGeoLocation;
  driverProfile: IDriverProfile;
}


