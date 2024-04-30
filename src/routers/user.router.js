import express from "express";
import {
  handleProcessRegister,
  handleDeleteUser,
  handleGetUser,
  handleGetUsers,
  handleActivateUserAccount,
} from "../controllers/user.controller.js";
import { isAdmin, isLoggedIn, isLoggedOut } from "../middlewares/auth.js";
const userRouter = express.Router();

//user router
userRouter.get("/users", isLoggedIn, handleGetUsers);
userRouter.get("/user/:id", isLoggedIn, isAdmin, handleGetUser);
userRouter.delete("/user/:id", isLoggedIn, handleDeleteUser);
userRouter.post("/user/register", isLoggedOut, handleProcessRegister);
userRouter.post("/user/verify/:token", isLoggedOut, handleActivateUserAccount);

export default userRouter;
