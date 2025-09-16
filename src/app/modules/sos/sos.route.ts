import express from "express";
import { createSOS, endSOS, updateSOS } from "./sos.controller";
import { sosLimiter } from "../../middlewares/rateLimiter";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";

const router = express.Router();


router.post("/", checkAuth(...Object.values(Role)), sosLimiter, createSOS);
router.patch("/:id/update", checkAuth(...Object.values(Role)), updateSOS);
router.patch("/:id/end", checkAuth(...Object.values(Role)), endSOS);


export const SosRoutes = router;