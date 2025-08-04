import express from "express";
import { rideControllers } from "./ride.controller";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { createRideZodSchema } from "./ride.validation";
import { validateRequest } from "../../middlewares/validateRequest";


const router = express.Router();

router.get("/", checkAuth(Role.ADMIN,), rideControllers.getAllRides);
router.post("/request", validateRequest(createRideZodSchema), checkAuth(...Object.values(Role)), rideControllers.requestRide);
router.patch("/:rideId/cancel", checkAuth(...Object.values(Role)), rideControllers.cancelRide);
export const RideRoutes = router;