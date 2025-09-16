import { Router } from "express";
import { DriverController } from "./driver.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { driverRegistrationZodSchema, updateDriverStatusZodSchema } from "./driver.validation";

const router = Router();

router.post("/create",validateRequest(driverRegistrationZodSchema),  checkAuth(...Object.values(Role)), DriverController.createDriver);
router.get("/", checkAuth(...Object.values(Role)), DriverController.getAllDrivers);
router.get("/nearest", checkAuth(...Object.values(Role)), DriverController.getDriverByNear);
router.get("/stats/me", checkAuth(Role.ADMIN, Role.DRIVER), DriverController.getDriverStatsMe);
router.patch(
  "/:id/status",
  validateRequest(updateDriverStatusZodSchema),
  checkAuth(Role.ADMIN, Role.DRIVER),
  DriverController.updateDriverStatus
);
router.get("/me", checkAuth(...Object.values(Role)), DriverController.getDriverMe);

export const DriverRoutes = router;