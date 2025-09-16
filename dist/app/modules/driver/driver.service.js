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
exports.DriverService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const payment_interface_1 = require("../payment/payment.interface");
const payment_model_1 = require("../payment/payment.model");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const driver_constant_1 = require("./driver.constant");
const driver_model_1 = require("./driver.model");
const ride_model_1 = require("../ride/ride.model");
const createDriver = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield driver_model_1.Driver.create(payload);
    return driver;
});
const getAllDrivers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(driver_model_1.Driver.find({ role: "DRIVER" }), query);
    const driversData = queryBuilder
        .filter()
        .search(driver_constant_1.driverSearchableFields)
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        driversData.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta,
    };
});
const getDriverByNear = (lng, lat, radius) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("Service query values:", { lng, lat, radius });
    return yield driver_model_1.Driver.findOne({
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
});
const updateDriverStatus = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields = {};
    if (payload.isOnline !== undefined)
        updateFields["driverProfile.isOnline"] = payload.isOnline;
    if (payload.approved !== undefined)
        updateFields["driverProfile.approved"] = payload.approved;
    const updatedDriver = yield driver_model_1.Driver.findOneAndUpdate({ _id: id }, { $set: updateFields }, { new: true, runValidators: true });
    // If approved, update user's role to DRIVER
    if (payload.approved === true && (updatedDriver === null || updatedDriver === void 0 ? void 0 : updatedDriver.riderId)) {
        yield user_model_1.User.findByIdAndUpdate(updatedDriver.riderId, { role: user_interface_1.Role.DRIVER }, { new: true });
    }
    return updatedDriver;
});
const getDriverStatsMe = (driverId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const objectId = new mongoose_1.default.Types.ObjectId(driverId);
    // ----------- Daily Earnings -----------
    const dailyEarnings = yield payment_model_1.Payment.aggregate([
        { $match: { status: payment_interface_1.PAYMENT_STATUS.PAID } },
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
    const weeklyEarnings = yield payment_model_1.Payment.aggregate([
        { $match: { status: payment_interface_1.PAYMENT_STATUS.PAID } },
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
    const monthlyEarnings = yield payment_model_1.Payment.aggregate([
        { $match: { status: payment_interface_1.PAYMENT_STATUS.PAID } },
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
    const totalStats = yield payment_model_1.Payment.aggregate([
        { $match: { status: payment_interface_1.PAYMENT_STATUS.PAID } },
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
    const completedRides = yield ride_model_1.Ride.countDocuments({
        driverId: objectId,
        status: "COMPLETED",
    });
    return {
        totalEarnings: ((_a = totalStats[0]) === null || _a === void 0 ? void 0 : _a.totalEarnings) || 0,
        totalRides: ((_b = totalStats[0]) === null || _b === void 0 ? void 0 : _b.totalRides) || 0,
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
});
const getDriverMe = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield driver_model_1.Driver.findById(id);
    return {
        data: driver
    };
});
exports.DriverService = {
    createDriver,
    getAllDrivers,
    getDriverByNear,
    getDriverMe,
    getDriverStatsMe,
    updateDriverStatus,
};
