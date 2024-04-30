import mongoose from "mongoose";
import { MONGODB_URI } from "../secret.js";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017", {
      dbName: "Backend_Practice",
    });
    console.log("Pinged! MongoDB connected successfully!");
    mongoose.connection.on("error", (err) => {
      console.log("Could not connect to MongoDB", err);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
