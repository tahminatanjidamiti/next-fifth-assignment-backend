import { Types } from "mongoose";

export enum Role {
  ADMIN = "ADMIN",
  RIDER="RIDER",
  DRIVER = "DRIVER",
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  INACTIVE = "INACTIVE",
}
export interface ILocation {
  lat: number;
  lng: number;
  formattedAddress?: string;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  picture?: string;
  address?: string;
  role: Role;
  password?: string;
  location?: ILocation;
  isActive?: IsActive;
  isVerified?: boolean;
  isDeleted?: boolean;
  auths: IAuthProvider[];
  bookings?: Types.ObjectId[];
  drivers?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAuthProvider {
  provider: "credentials" | "google";
  providerId: string;
}
