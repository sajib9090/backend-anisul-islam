import createError from "http-errors";
import jwt from "jsonwebtoken";
import { jwtAccessToken } from "../secret.js";

const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw createError(401, "Access token not found. Please Login First");
    }

    const decoded = jwt.verify(token, jwtAccessToken);
    // console.log(decoded);
    // send user information
    req.user = decoded.user;
    if (!decoded) {
      throw createError(
        403,
        "Failed to authenticate token. Please login again"
      );
    }

    next();
  } catch (error) {
    return next(error);
  }
};
const isLoggedOut = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (token) {
      throw createError(400, "User already logged in");
    }

    next();
  } catch (error) {
    return next(error);
  }
};
const isAdmin = async (req, res, next) => {
  try {
    // const token = req.cookies.accessToken;
    // if (!token) {
    //   isLoggedOut();
    // }
    // extract admin value
    const adminUser = req.user && req.user.isAdmin;
    // console.log(req.headers.authorization ? "true" : "false");
    if (!adminUser) {
      throw createError(403, "Forbidden access. Only admin can access");
    }

    next();
  } catch (error) {
    return next(error);
  }
};

export { isLoggedIn, isLoggedOut, isAdmin };
