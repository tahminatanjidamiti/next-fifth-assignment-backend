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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const payment_model_1 = require("../payment/payment.model");
const payment_interface_1 = require("../payment/payment.interface");
const ride_model_1 = require("../ride/ride.model");
const user_model_1 = require("../user/user.model");
const user_interface_1 = require("../user/user.interface");
const booking_model_1 = require("../booking/booking.model");
const driver_model_1 = require("../driver/driver.model");
const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);
const getUserStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const [totalUsers, activeUsers, inactiveUsers, blockedUsers, newUsers7, newUsers30, usersByRole] = yield Promise.all([
        user_model_1.User.countDocuments(),
        user_model_1.User.countDocuments({ isActive: user_interface_1.IsActive.ACTIVE }),
        user_model_1.User.countDocuments({ isActive: user_interface_1.IsActive.INACTIVE }),
        user_model_1.User.countDocuments({ isActive: user_interface_1.IsActive.BLOCKED }),
        user_model_1.User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        user_model_1.User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        user_model_1.User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]),
    ]);
    return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        blockedUsers,
        newUsers7,
        newUsers30,
        usersByRole,
    };
});
const getRideStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const [totalRides, ridesByStatus, topRoutes, avgDistance] = yield Promise.all([
        ride_model_1.Ride.countDocuments(),
        ride_model_1.Ride.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        ride_model_1.Ride.aggregate([
            {
                $group: {
                    _id: {
                        from: "$pickupLocation.formattedAddress",
                        to: "$dropoffLocation.formattedAddress",
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    route: {
                        $concat: [
                            { $ifNull: ["$_id.from", "Unknown Pickup"] },
                            " → ",
                            { $ifNull: ["$_id.to", "Unknown Dropoff"] }
                        ]
                    },
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]),
        ride_model_1.Ride.aggregate([
            { $group: { _id: null, avgDistance: { $avg: "$distanceKm" } } }
        ])
    ]);
    return {
        totalRides,
        ridesByStatus,
        topRoutes,
        avgDistance: ((_a = avgDistance === null || avgDistance === void 0 ? void 0 : avgDistance[0]) === null || _a === void 0 ? void 0 : _a.avgDistance) || 0
    };
});
const getDriverStats = (driverId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const [totalRides, completedRides, earnings, recentRides, totalDrivers,] = yield Promise.all([
        ride_model_1.Ride.countDocuments({ driver: driverId }),
        ride_model_1.Ride.countDocuments({ driver: driverId, status: "COMPLETED" }),
        payment_model_1.Payment.aggregate([
            { $match: { driver: driverId, status: payment_interface_1.PAYMENT_STATUS.PAID } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        ride_model_1.Ride.find({ driver: driverId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("pickupLocation dropoffLocation distanceKm status createdAt"),
        driver_model_1.Driver.countDocuments(),
    ]);
    return {
        totalRides,
        completedRides,
        totalEarnings: ((_a = earnings === null || earnings === void 0 ? void 0 : earnings[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
        recentRides,
        totalDrivers,
    };
});
const getBookingStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const [totalBookings, bookingsByStatus, uniqueUsers, bookings7, bookings30] = yield Promise.all([
        booking_model_1.RideBooking.countDocuments(),
        booking_model_1.RideBooking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        booking_model_1.RideBooking.distinct("rider").then(riders => riders.length),
        booking_model_1.RideBooking.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        booking_model_1.RideBooking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);
    return {
        totalBookings,
        bookingsByStatus,
        uniqueUsers,
        bookings7,
        bookings30,
    };
});
const getPaymentStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const [totalPayments, paymentsByStatus, totalRevenue, avgAmount, gateways] = yield Promise.all([
        payment_model_1.Payment.countDocuments(),
        payment_model_1.Payment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        payment_model_1.Payment.aggregate([
            { $match: { status: payment_interface_1.PAYMENT_STATUS.PAID } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        payment_model_1.Payment.aggregate([
            { $group: { _id: null, avg: { $avg: "$amount" } } }
        ]),
        payment_model_1.Payment.aggregate([
            { $group: { _id: "$paymentGatewayData.status", count: { $sum: 1 } } }
        ]),
    ]);
    return {
        totalPayments,
        paymentsByStatus,
        totalRevenue: ((_a = totalRevenue === null || totalRevenue === void 0 ? void 0 : totalRevenue[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
        avgAmount: ((_b = avgAmount === null || avgAmount === void 0 ? void 0 : avgAmount[0]) === null || _b === void 0 ? void 0 : _b.avg) || 0,
        gateways,
    };
});
exports.StatsService = {
    getUserStats,
    getRideStats,
    getDriverStats,
    getBookingStats,
    getPaymentStats,
};
