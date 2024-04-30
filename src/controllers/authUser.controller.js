import createError from "http-errors";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import createJWT from "../helper/jwt.js";
import bcrypt from "bcryptjs";
import { jwtAccessToken, jwtRefreshToken } from "../secret.js";

const handleLoginUser = async (req, res, next) => {
  try {
    //EXTRACT OR RECEIVE EMAIL AND PASSWORD
    const { email, password } = req.body;
    // VALIDATE EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      next(createError.BadRequest("Invalid email address format"));
      return;
    }
    //MATCH EMAIL
    const user = await User.findOne({ email });
    if (!user) {
      next(
        createError.Unauthorized("Invalid email address. Cannot find any user.")
      );
      return;
    }

    //password validation
    if (password.length < 6) {
      next(
        createError.Unauthorized("Password should be at least 6 characters")
      );
      return;
    }
    //MATCH PASSWORD
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      next(createError.Unauthorized("Invalid Password"));
      return;
    }

    //CHECK USER BANNED OR NOT
    if (user.isBanned) {
      next(
        createError.Unauthorized("You are banned. Please contact authority")
      );
      return;
    }

    // first make user object then delete a key value by using delete from the object
    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    //TOKEN COOKIE
    const accessToken = await createJWT({ user }, jwtAccessToken, "1m");

    res.cookie("accessToken", accessToken, {
      maxAge: 60 * 1000, // 1 minute in milliseconds
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    const refreshToken = await createJWT({ user }, jwtRefreshToken, "7d");
    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    // success response
    res.status(200).send({
      success: true,
      message: "User logged in successfully",
      user: { loggedInUser },
    });
  } catch (error) {
    next(error);
  }
};
const handleLogoutUser = async (req, res, next) => {
  try {
    // Check if the user is authenticated
    // console.log(req.user);
    if (!req.user) {
      throw createError.Unauthorized("User is not authenticated");
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    //success response
    res.status(200).send({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

const handleRefreshToken = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    // console.log(oldRefreshToken);
    //verify refresh token
    const decodedToken = jwt.verify(oldRefreshToken, jwtRefreshToken);
    // console.log(decodedToken.user);
    if (!decodedToken) {
      throw createError(401, "Invalid refresh token. Please Login again");
    }

    // if token validation success generate new access token
    const accessToken = await createJWT(
      { user: decodedToken.user },
      jwtAccessToken,
      "1m"
    );
    res.cookie("accessToken", accessToken, {
      maxAge: 60 * 1000, // 1 minute in milliseconds
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    // Update req.user with the new decoded user information
    req.user = decodedToken.user;
    //success response
    res.status(200).send({
      success: true,
      message: "New access token generate successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { handleLoginUser, handleLogoutUser, handleRefreshToken };
