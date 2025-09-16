"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const booking_route_1 = require("../modules/booking/booking.route");
const payment_route_1 = require("../modules/payment/payment.route");
const oto_route_1 = require("../modules/otp/oto.route");
const stats_route_1 = require("../modules/stats/stats.route");
const driver_route_1 = require("../modules/driver/driver.route");
const ride_route_1 = require("../modules/ride/ride.route");
const sos_route_1 = require("../modules/sos/sos.route");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/user",
        route: user_route_1.UserRoutes
    },
    {
        path: "/drivers",
        route: driver_route_1.DriverRoutes
    },
    {
        path: "/rides",
        route: ride_route_1.RideRoutes
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes
    },
    {
        path: "/booking",
        route: booking_route_1.BookingRoutes
    },
    {
        path: "/payment",
        route: payment_route_1.PaymentRoutes
    },
    {
        path: "/otp",
        route: oto_route_1.OtpRoutes
    },
    {
        path: "/sos",
        route: sos_route_1.SosRoutes
    },
    {
        path: "/stats",
        route: stats_route_1.StatsRoutes
    },
];
moduleRoutes.forEach((route) => {
    exports.router.use(route.path, route.route);
});
