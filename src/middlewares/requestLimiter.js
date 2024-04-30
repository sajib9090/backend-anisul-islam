import { rateLimit } from "express-rate-limit";
const rateLimiter = (time, limit, message) => {
  return rateLimit({
    windowMs: time,
    limit: limit,
    handler: (_, res) => {
      res.status(429).json({
        success: false,
        message: message || "Too many failed attempts, please try later.",
      });
    },
  });
};

export default rateLimiter;
