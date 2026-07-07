import mongoose from "mongoose";

const conversationEntrySchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: {
      type: String,
      enum: ["draft", "submitted", "filed", "resolved"],
      default: "draft",
    },

    // Guided Q&A transcript
    conversation: [conversationEntrySchema],

    // Set by the /classify endpoint (Gemini or fallback rules)
    crimeType: { type: String, default: null },
    crimeCategoryConfidence: { type: Number, default: null },

    incidentDetails: {
      description: { type: String, default: "" },
      dateOfIncident: { type: Date },
      amountLost: { type: Number },
      platform: { type: String },
      suspectInfo: { type: String },
    },

    requiredEvidence: [{ type: String }],
    evidenceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Evidence" }],

    routedAuthority: {
      name: { type: String },
      portalUrl: { type: String },
      contactInfo: { type: String },
    },

    generatedSummary: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },

    officerNotes: { type: String, default: "" },

    submittedAt: { type: Date },
  },
  { timestamps: true }
);

complaintSchema.index({ userId: 1 });

export default mongoose.model("Complaint", complaintSchema);
