import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import http from "node:http"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connectDB from "./src/config/db.js";
import errorHandler from "./src/middleware/errorHandler.js";

import authRoutes from "./src/routes/auth.routes.js";
import complaintRoutes from "./src/routes/complaint.routes.js";
import evidenceRoutes from "./src/routes/evidence.routes.js";
import routingRoutes from "./src/routes/routing.routes.js";
import morgan from "morgan";

const app = express();

// --- Core middleware ---
app.use(helmet());
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server proxy, curl)
      if (!origin) return callback(null, true);
      
      // In development, allow all origins to make local network testing seamless
      if (process.env.NODE_ENV === "development") return callback(null, true);

      // In production, strictly check against ALLOWED_ORIGINS
      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"))


// Basic rate limiting on all API routes
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", limiter);

// Serve generated PDFs / uploaded evidence statically (local dev storage)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
// evidence routes are nested under a complaint id
app.use("/api/complaints/:id/evidence", evidenceRoutes);
app.use("/api/routing", routingRoutes);

app.get("/api/health", (req, res) => res.json({ success: true, message: "API is running" }));

// --- Error handler (must be last) ---
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
const server = http.createServer(app)

connectDB().then(() => {
  server.listen(PORT, HOST, () => console.log(`Server running on port ${PORT}`));
});
