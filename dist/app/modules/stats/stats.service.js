"use strict";
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
const getUserStats = async () => {
    const [totalUsers, activeUsers, inactiveUsers, blockedUsers, newUsers7, newUsers30, usersByRole] = await Promise.all([
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
};
const getRideStats = async () => {
    const [totalRides, ridesByStatus, topRoutes, avgDistance] = await Promise.all([
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
        avgDistance: avgDistance?.[0]?.avgDistance || 0
    };
};
const getDriverStats = async (driverId) => {
    const [totalRides, completedRides, earnings, recentRides, totalDrivers,] = await Promise.all([
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
        totalEarnings: earnings?.[0]?.total || 0,
        recentRides,
        totalDrivers,
    };
};
const getBookingStats = async () => {
    const [totalBookings, bookingsByStatus, uniqueUsers, bookings7, bookings30] = await Promise.all([
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
};
const getPaymentStats = async () => {
    const [totalPayments, paymentsByStatus, totalRevenue, avgAmount, gateways] = await Promise.all([
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
        totalRevenue: totalRevenue?.[0]?.total || 0,
        avgAmount: avgAmount?.[0]?.avg || 0,
        gateways,
    };
};
exports.StatsService = {
    getUserStats,
    getRideStats,
    getDriverStats,
    getBookingStats,
    getPaymentStats,
};
