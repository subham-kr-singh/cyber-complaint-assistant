import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  startComplaint,
  answerQuestion,
  getComplaint,
  listComplaints,
  listAllComplaints,
  updateComplaint,
  deleteComplaint,
  classifyComplaint,
  submitComplaint,
  getSummary,
  downloadPdf,
  getStatus,
  updateStatus,
} from "../controllers/complaint.controller.js";

const router = express.Router();

router.use(protect); // every complaint route requires a logged-in user

router.post("/start", startComplaint);
router.get("/", listComplaints);
router.get("/admin", adminOnly, listAllComplaints);
router.get("/:id", getComplaint);
router.patch("/:id", updateComplaint);
router.delete("/:id", deleteComplaint);

router.post("/:id/answer", answerQuestion);
router.post("/:id/classify", classifyComplaint);
router.post("/:id/submit", submitComplaint);

router.get("/:id/summary", getSummary);
router.get("/:id/pdf", downloadPdf);

router.get("/:id/status", getStatus);
router.patch("/:id/status", adminOnly, updateStatus);

export default router;
