import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { protect } from "../middleware/auth.js";
import { uploadEvidence, listEvidence, deleteEvidence } from "../controllers/evidence.controller.js";

const router = express.Router({ mergeParams: true });

// Basic local disk storage for the hackathon build.
// Swap this out for Cloudinary/S3 storage in production.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/evidence"));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.use(protect);

// Mounted at /api/complaints/:id/evidence in server.js
router.post("/", upload.single("file"), uploadEvidence);
router.get("/", listEvidence);
router.delete("/:fileId", deleteEvidence);

export default router;
