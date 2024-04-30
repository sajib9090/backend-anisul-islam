import express from "express";
import {
  handleLoginUser,
  handleLogoutUser,
  handleRefreshToken,
} from "../controllers/authUser.controller.js";
import { isLoggedIn, isLoggedOut } from "../middlewares/auth.js";
import rateLimiter from "../middlewares/requestLimiter.js";
const userAuthRouter = express.Router();

const limiter = rateLimiter(
  1 * 60 * 1000,
  15,
  "Too many failed attempts. Please try later."
);

//user router
userAuthRouter.post("/user/auth/login", limiter, isLoggedOut, handleLoginUser);
userAuthRouter.post("/user/auth/logout", isLoggedIn, handleLogoutUser);
userAuthRouter.get("/user/auth/refresh-token", handleRefreshToken);

export default userAuthRouter;
