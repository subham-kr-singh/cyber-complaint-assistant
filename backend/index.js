import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connectDB from "./src/config/db.js";
import errorHandler from "./src/middleware/errorHandler.js";

import authRoutes from "./src/routes/auth.routes.js";
import complaintRoutes from "./src/routes/complaint.routes.js";
import evidenceRoutes from "./src/routes/evidence.routes.js";
import routingRoutes from "./src/routes/routing.routes.js";

const app = express();

// --- Core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

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

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
