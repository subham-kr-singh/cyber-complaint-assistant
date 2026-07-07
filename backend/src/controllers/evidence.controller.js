import Evidence from "../models/Evidence.js";
import Complaint from "../models/Complaint.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const detectFileType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.includes("word") || mimetype.includes("document")) return "document";
  return "other";
}

// POST /api/complaints/:id/evidence
// Expects file uploaded via multer (req.file) and already stored
// (locally or on Cloudinary) with the URL on req.file.path / req.file.secure_url
const uploadEvidence = asyncHandler(async (req, res, next) => {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id });
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const evidence = await Evidence.create({
      complaintId: complaint._id,
      fileName: req.file.originalname,
      fileType: detectFileType(req.file.mimetype),
      fileUrl: req.file.path || req.file.secure_url,
    });

    complaint.evidenceIds.push(evidence._id);
    await complaint.save();

    res.status(201).json({ success: true, evidence });
  });

// GET /api/complaints/:id/evidence
const listEvidence = asyncHandler(async (req, res, next) => {
    const evidence = await Evidence.find({ complaintId: req.params.id });
    res.json({ success: true, evidence });
  });

// DELETE /api/complaints/:id/evidence/:fileId
const deleteEvidence = asyncHandler(async (req, res, next) => {
    const evidence = await Evidence.findOneAndDelete({
      _id: req.params.fileId,
      complaintId: req.params.id,
    });
    if (!evidence) return res.status(404).json({ success: false, message: "Evidence not found" });

    await Complaint.findByIdAndUpdate(req.params.id, { $pull: { evidenceIds: evidence._id } });

    res.json({ success: true, message: "Evidence removed" });
  });

export {  uploadEvidence, listEvidence, deleteEvidence  };
