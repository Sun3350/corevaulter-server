// ─────────────────────────────────────────────────────────────
//  Imports
// ─────────────────────────────────────────────────────────────
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("../routes/auth.routes");

// ─────────────────────────────────────────────────────────────
//  Config & Env
// ─────────────────────────────────────────────────────────────
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://corevaulter:PmWt5keAR3rGIFRG@corevaulter.eaf2e4l.mongodb.net/";
const FRONTEND_URL = "https://corevaulter.com";

// ─────────────────────────────────────────────────────────────
//  MongoDB Connection
// ─────────────────────────────────────────────────────────────
const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "corevaulter" });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_URL || "https://corevaulter.com",
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
