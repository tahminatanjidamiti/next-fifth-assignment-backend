"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sosLimiter = exports.globalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Global limiter
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { ok: false, message: "Too many requests. Please try later." },
});
// Specific limiter for SOS
exports.sosLimiter = (0, express_rate_limit_1.default)({
    windowMs: 30 * 60 * 1000,
    max: 2,
    message: { ok: false, message: "Too many SOS requests. Please wait." },
});
