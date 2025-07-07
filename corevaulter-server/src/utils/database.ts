import mongoose from "mongoose";
import { MONGO_URI } from "./config";

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "corevaulter",
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
