import { Types } from "mongoose";

export interface ILocation {
    lat: number;
    lng: number;
    formattedAddress?: string;
}

export enum RideStatus {
    REQUESTED = "REQUESTED",
    ACCEPTED = "ACCEPTED",
    PICKED_UP = "PICKED_UP",
    IN_TRANSIT = "IN_TRANSIT",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}


export interface IRide {
    _id?: Types.ObjectId;
    riderId: Types.ObjectId;
    driverId: Types.ObjectId;
    pickupLocation: ILocation;
    dropoffLocation: ILocation;
    status: RideStatus;
    fare: number;
    distanceKm?: number;
    estimatedTime?: number;
    createdAt?: Date;
    updatedAt?: Date;
}