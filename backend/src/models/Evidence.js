import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema(
  {
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, enum: ["image", "pdf", "document", "other"], default: "other" },
    fileUrl: { type: String, required: true },
  },
  { timestamps: { createdAt: "uploadedAt", updatedAt: false } }
);

evidenceSchema.index({ complaintId: 1 });

export default mongoose.model("Evidence", evidenceSchema);
