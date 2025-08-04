"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultDriverProfile = exports.driverSearchableFields = void 0;
exports.driverSearchableFields = ["name", "email", "phoneNumber", "driverProfile"];
exports.defaultDriverProfile = {
    approved: false,
    isOnline: false,
    earnings: 0,
    rating: 0,
    totalRides: 0,
    cancelAttempts: 0,
};
