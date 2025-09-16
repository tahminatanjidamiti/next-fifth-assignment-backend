"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SosEvent = void 0;
const mongoose_1 = require("mongoose");
// ---- Schema ----
const SosEventSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
    versionKey: false
});
exports.SosEvent = (0, mongoose_1.model)("SosEvent", SosEventSchema);
