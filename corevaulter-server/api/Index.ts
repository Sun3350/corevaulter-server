// ─────────────────────────────────────────────────────────────
//  Imports
// ─────────────────────────────────────────────────────────────
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "../src/routes/auth.routes";
import { connectToDatabase } from "../src/utils/database";
import { PORT } from "../src/utils/config";

// ─────────────────────────────────────────────────────────────
//  App Initialization
// ─────────────────────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────────────────────
//  Middleware
// ─────────────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: "https://corevaulter.com",
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────
//  Routes
// ─────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// ─────────────────────────────────────────────────────────────
//  Server Start
// ─────────────────────────────────────────────────────────────
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

export default app;
