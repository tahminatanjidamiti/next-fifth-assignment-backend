"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SosRoutes = void 0;
const express_1 = __importDefault(require("express"));
const sos_controller_1 = require("./sos.controller");
const rateLimiter_1 = require("../../middlewares/rateLimiter");
const user_interface_1 = require("../user/user.interface");
const checkAuth_1 = require("../../middlewares/checkAuth");
const router = express_1.default.Router();
router.post("/", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), rateLimiter_1.sosLimiter, sos_controller_1.createSOS);
router.patch("/:id/update", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), sos_controller_1.updateSOS);
router.patch("/:id/end", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), sos_controller_1.endSOS);
exports.SosRoutes = router;
