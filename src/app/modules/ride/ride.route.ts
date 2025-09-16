import express from "express";
import { rideControllers } from "./ride.controller";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { createRideZodSchema } from "./ride.validation";
import { validateRequest } from "../../middlewares/validateRequest";


const router = express.Router();

router.post("/request", validateRequest(createRideZodSchema), checkAuth(...Object.values(Role)), rideControllers.requestRide);
router.get("/", checkAuth(...Object.values(Role)), rideControllers.getAllRides);
router.get("/my-rides-history",
    checkAuth(...Object.values(Role)),
    rideControllers.getMyRideHistory
);
router.patch("/:rideId/cancel", checkAuth(...Object.values(Role)), rideControllers.cancelRide);
export const RideRoutes = router;