import rateLimit from "express-rate-limit";

// Global limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { ok: false, message: "Too many requests. Please try later." },
});

// Specific limiter for SOS
export const sosLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 2,
  message: { ok: false, message: "Too many SOS requests. Please wait." },
});
