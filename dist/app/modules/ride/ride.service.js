"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rideService = void 0;
const ride_model_1 = require("./ride.model");
const ride_interface_1 = require("./ride.interface");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const ride_constant_1 = require("./ride.constant");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requestRide = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield ride_model_1.Ride.create(payload);
});
const getAllRides = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(ride_model_1.Ride.find(), query);
    const ridesData = queryBuilder
        .filter()
        .search(ride_constant_1.rideSearchableFields)
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        ridesData.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta,
    };
});
const cancelRide = (rideId) => __awaiter(void 0, void 0, void 0, function* () {
    const ride = yield ride_model_1.Ride.findById(rideId);
    if (!ride) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found");
    }
    if (ride.status === "COMPLETED") {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Completed ride cannot be cancelled");
    }
    if (ride.status === "CANCELLED") {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Ride is already cancelled");
    }
    ride.status = ride_interface_1.RideStatus.CANCELLED;
    yield ride.save();
    return ride;
});
const getMyRideHistory = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const rides = yield ride_model_1.Ride.find({ riderId: userId })
        .populate("riderId", "name email phone role isActive locaton bookings")
        .populate("driverId", "name email phone role driverProfile")
        .sort({ createdAt: -1 });
    return rides;
});
exports.rideService = {
    requestRide,
    getAllRides,
    cancelRide,
    getMyRideHistory
};
