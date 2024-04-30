import createError from "http-errors";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import findDataById from "../services/findDataById.js";
import createJWT from "../helper/jwt.js";
import { clientURL, jwtSecret } from "../secret.js";
import { emailWithNodeMailer } from "../helper/email.js";

const handleGetUsers = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const regExSearch = new RegExp(".*" + search + ".*", "i");

    // necessary filter
    const filter = {
      isAdmin: {
        $ne: true,
      },
      $or: [
        { username: { $regex: regExSearch } },
        { email: { $regex: regExSearch } },
      ],
    };
    const options = { password: 0 };
    const users = await User.find(filter, options)
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await User.find(filter).countDocuments();

    // Respond with the list of users
    res.status(200).send({
      success: true,
      message: "Users retrieved successfully",
      users,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        previousPage: page - 1 > 0 ? page - 1 : null,
        nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
      },
    });
  } catch (error) {
    next(error);
  }
};
const handleGetUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = { password: 0 };
    const user = await findDataById(id, User, options, next);
    res
      .status(200)
      .send({ success: true, message: "User retrieved successfully", user });
  } catch (error) {
    next(error);
  }
};
const handleDeleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;

    const user = await findDataById(id, User, options, next);
    res
      .status(200)
      .send({ success: true, message: "User retrieved successfully", user });
  } catch (error) {
    next(error);
  }
};
const handleProcessRegister = async (req, res, next) => {
  try {
    const { username, email, password, avatar } = req.body;

    // Validate the request body
    if (!username || !email || !password) {
      throw createError(400, "Username, Email and password are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError(400, "Invalid email address");
    }

    // Validate email format
    if (password.length < 6) {
      throw createError(401, "Password must be at least 6 characters long");
    }

    // Validate username format (not starting with a number)
    if (/^\d/.test(username)) {
      throw createError(400, "Username cannot start with number");
    }

    const existingUser = await User.exists({
      $or: [{ email: email }, { username: username }],
    });

    if (existingUser) {
      throw createError(
        "409",
        "User already exist with this username or email. Please sign in"
      );
    }

    //create token
    const token = await createJWT(
      { username, email, password, avatar },
      jwtSecret,
      "5m"
    );

    //prepare email
    const emailData = {
      email,
      subject: "Account Creation Confirmation",
      html: `<h2>Hello ${username}!</h2>
      <p>Please click here to <a href="${clientURL}/api/v1/user/verify/${token}">activate your account</a></p>
      <p>This link will expires in 5 minutes</p>`,
    };

    //send email with nodemailer
    try {
      await emailWithNodeMailer(emailData);
    } catch (emailError) {
      next(createError(500, "Failed to send verification email"));
    }

    // Respond with the validation user
    res.status(200).send({
      success: true,
      message: `Please go to your email at ${email} and complete registration process`,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const handleActivateUserAccount = async (req, res, next) => {
  try {
    const token = req.params.token;

    if (!token) {
      throw createError(404, "Token not found");
    }

    const decoded = jwt.verify(token, jwtSecret);
    // Respond with the created user
    if (!decoded) {
      throw createError(404, "User validation failed");
    }

    const existingUser = await User.exists({
      $or: [{ email: decoded.email }, { username: decoded.username }],
    });

    if (existingUser) {
      throw createError(
        "409",
        "User already exist with this username or email. Please sign in"
      );
    }
    await User.create(decoded);
    res.status(201).send({
      success: true,
      message: `User were registered successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export {
  handleGetUsers,
  handleProcessRegister,
  handleGetUser,
  handleDeleteUser,
  handleActivateUserAccount,
};
