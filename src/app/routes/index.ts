import { Router } from "express"
import { UserRoutes } from "../modules/user/user.route"
import { AuthRoutes } from "../modules/auth/auth.route"
import { BookingRoutes } from "../modules/booking/booking.route"
import { PaymentRoutes } from "../modules/payment/payment.route"
import { OtpRoutes } from "../modules/otp/oto.route"
import { StatsRoutes } from "../modules/stats/stats.route"
import { DriverRoutes } from "../modules/driver/driver.route"
import { RideRoutes } from "../modules/ride/ride.route"
import { SosRoutes } from "../modules/sos/sos.route"

export const router = Router()

const moduleRoutes = [
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/drivers",
        route: DriverRoutes
    },
    {
        path: "/rides",
        route: RideRoutes
    },
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/booking",
        route: BookingRoutes
    },
    {
        path: "/payment",
        route: PaymentRoutes
    },
    {
        path: "/otp",
        route: OtpRoutes
    },
    {
        path: "/sos",
        route: SosRoutes
    },
    {
        path: "/stats",
        route: StatsRoutes
    },
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})