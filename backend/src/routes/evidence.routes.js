import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import { uploadEvidence, listEvidence, deleteEvidence } from "../controllers/evidence.controller.js";

const router = express.Router({ mergeParams: true });

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images, PDFs, and Word documents are allowed."), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

router.use(protect);

// Mounted at /api/complaints/:id/evidence in server.js
router.post("/", upload.single("file"), uploadEvidence);
router.get("/", listEvidence);
router.delete("/:fileId", deleteEvidence);

export default router;
