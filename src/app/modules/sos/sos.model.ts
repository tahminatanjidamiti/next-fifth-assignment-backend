import { Schema, Types, model } from "mongoose";

// ---- Types ----
export interface IContact {
  email?: string;
  phone?: string;
}

export interface ILocation {
  lat: number;
  lng: number;
  ts?: Date;
  formattedAddress?: string;
}

export interface IUpdate {
  lat: number;
  lng: number;
  ts: Date;
}


export interface ISosEvent {
  _id?: Types.ObjectId;
  contacts: IContact[];
  initialLocation: ILocation;
  updates: IUpdate[];
  live: boolean;
  liveExpiresAt?: Date | null;
  status: "active" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

// ---- Schema ----
const SosEventSchema = new Schema<ISosEvent>(
  {
    contacts: [
      {
        email: { type: String },
        phone: { type: String },
      },
    ],
    initialLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      ts: { type: Date, default: Date.now },
      formattedAddress: { type: String },
    },
    updates: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        ts: { type: Date, required: true },
      },
    ],
    live: { type: Boolean, default: false },
    liveExpiresAt: { type: Date, default: null },
    status: { type: String, enum: ["active", "resolved"], default: "active" },
  },
  {
    timestamps: true,
    versionKey: false
  }
);


export const SosEvent = model<ISosEvent>("SosEvent", SosEventSchema)