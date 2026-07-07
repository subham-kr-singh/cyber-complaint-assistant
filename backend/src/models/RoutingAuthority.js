import mongoose from "mongoose";

const routingAuthoritySchema = new mongoose.Schema(
  {
    crimeType: { type: String, required: true, unique: true, lowercase: true, trim: true },
    authorityName: { type: String, required: true },
    portalUrl: { type: String, required: true },
    contactInfo: { type: String },
    requiredEvidenceList: [{ type: String }],
    jurisdictionNotes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("RoutingAuthority", routingAuthoritySchema);
