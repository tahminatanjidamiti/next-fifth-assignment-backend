"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RideRoutes = void 0;
const express_1 = __importDefault(require("express"));
const ride_controller_1 = require("./ride.controller");
const user_interface_1 = require("../user/user.interface");
const checkAuth_1 = require("../../middlewares/checkAuth");
const ride_validation_1 = require("./ride.validation");
const validateRequest_1 = require("../../middlewares/validateRequest");
const router = express_1.default.Router();
router.post("/request", (0, validateRequest_1.validateRequest)(ride_validation_1.createRideZodSchema), (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), ride_controller_1.rideControllers.requestRide);
router.get("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), ride_controller_1.rideControllers.getAllRides);
router.get("/my-rides-history", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), ride_controller_1.rideControllers.getMyRideHistory);
router.patch("/:rideId/cancel", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), ride_controller_1.rideControllers.cancelRide);
exports.RideRoutes = router;
