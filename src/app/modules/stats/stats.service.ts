import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Ride } from "../ride/ride.model";
import { User } from "../user/user.model";
import { IsActive } from "../user/user.interface";
import { RideBooking } from "../booking/booking.model";
import { Driver } from "../driver/driver.model";

const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);

const getUserStats = async () => {
  const [totalUsers, activeUsers, inactiveUsers, blockedUsers, newUsers7, newUsers30, usersByRole] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: IsActive.ACTIVE }),
      User.countDocuments({ isActive: IsActive.INACTIVE }),
      User.countDocuments({ isActive: IsActive.BLOCKED }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.aggregate([
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
    Ride.countDocuments(),
    Ride.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Ride.aggregate([
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
    Ride.aggregate([
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


const getDriverStats = async (driverId: string) => {
  const [
    totalRides,
    completedRides,
    earnings,
    recentRides,
    totalDrivers,
    dailyEarnings,
    weeklyEarnings,
    monthlyEarnings,
  ] = await Promise.all([
    Ride.countDocuments({ driver: driverId }),
    Ride.countDocuments({ driver: driverId, status: "COMPLETED" }),
    Payment.aggregate([
      { $match: { driver: driverId, status: PAYMENT_STATUS.PAID } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Ride.find({ driver: driverId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("pickupLocation dropoffLocation distanceKm status createdAt"),
    Driver.countDocuments(),

    // 📊 Daily earnings
    Payment.aggregate([
      { $match: { driver: driverId, status: PAYMENT_STATUS.PAID } },
      {
        $group: {
          _id: { day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]),

    // 📊 Weekly earnings
    Payment.aggregate([
      { $match: { driver: driverId, status: PAYMENT_STATUS.PAID } },
      {
        $group: {
          _id: { week: { $isoWeek: "$createdAt" }, year: { $year: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
    ]),

    // 📊 Monthly earnings
    Payment.aggregate([
      { $match: { driver: driverId, status: PAYMENT_STATUS.PAID } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  return {
    totalRides,
    completedRides,
    totalEarnings: earnings?.[0]?.total || 0,
    recentRides,
    totalDrivers,
    charts: {
      daily: dailyEarnings.map(d => ({ date: d._id.day, earnings: d.total })),
      weekly: weeklyEarnings.map(d => ({
        week: `${d._id.year}-W${d._id.week}`,
        earnings: d.total,
      })),
      monthly: monthlyEarnings.map(d => ({
        month: `${d._id.year}-${d._id.month}`,
        earnings: d.total,
      })),
    },
  };
};




const getBookingStats = async () => {
  const [totalBookings, bookingsByStatus, uniqueUsers, bookings7, bookings30] = await Promise.all([
    RideBooking.countDocuments(),
    RideBooking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    RideBooking.distinct("rider").then(riders => riders.length),
    RideBooking.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    RideBooking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
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
    Payment.countDocuments(),
    Payment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Payment.aggregate([
      { $match: { status: PAYMENT_STATUS.PAID } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Payment.aggregate([
      { $group: { _id: null, avg: { $avg: "$amount" } } }
    ]),
    Payment.aggregate([
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

export const StatsService = {
  getUserStats,
  getRideStats,
  getDriverStats,
  getBookingStats,
  getPaymentStats,
};