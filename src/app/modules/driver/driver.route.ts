import { Router } from "express";
import { DriverController } from "./driver.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { driverRegistrationZodSchema, updateDriverStatusZodSchema } from "./driver.validation";

const router = Router();

router.post("/create",validateRequest(driverRegistrationZodSchema),  checkAuth(Role.ADMIN), DriverController.createDriver);
router.get("/", checkAuth(Role.ADMIN), DriverController.getAllDrivers);
router.get("/nearest", checkAuth(...Object.values(Role)), DriverController.getDriverByNear);
router.patch(
  "/:id/status",
  validateRequest(updateDriverStatusZodSchema),
  checkAuth(Role.ADMIN, Role.DRIVER),
  DriverController.updateDriverStatus
);
router.get("/:id", checkAuth(...Object.values(Role)), DriverController.getDriverById);

export const DriverRoutes = router;