import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import RoutingAuthority from "../models/RoutingAuthority.js";

const data = [
  {
    crimeType: "upi_fraud",
    authorityName: "National Cyber Crime Reporting Portal",
    portalUrl: "https://cybercrime.gov.in",
    contactInfo: "Helpline: 1930",
    requiredEvidenceList: ["transaction_screenshot", "bank_statement", "upi_transaction_id"],
    jurisdictionNotes: "File on national portal; also inform your bank immediately to freeze funds.",
  },
  {
    crimeType: "phishing",
    authorityName: "National Cyber Crime Reporting Portal",
    portalUrl: "https://cybercrime.gov.in",
    contactInfo: "Helpline: 1930",
    requiredEvidenceList: ["screenshot_of_link", "email_headers"],
    jurisdictionNotes: "File under 'Report Other Cyber Crime' category.",
  },
  {
    crimeType: "sextortion",
    authorityName: "National Cyber Crime Reporting Portal (Women & Child section)",
    portalUrl: "https://cybercrime.gov.in",
    contactInfo: "Helpline: 1930",
    requiredEvidenceList: ["chat_screenshots", "suspect_profile_link"],
    jurisdictionNotes: "Can be filed anonymously under the women/child safety category.",
  },
  {
    crimeType: "cyberbullying",
    authorityName: "Local Cyber Crime Cell",
    portalUrl: "https://cybercrime.gov.in",
    contactInfo: "Helpline: 1930",
    requiredEvidenceList: ["screenshots", "profile_links"],
    jurisdictionNotes: "Local police cyber cell can also assist directly.",
  },
  {
    crimeType: "identity_theft",
    authorityName: "National Cyber Crime Reporting Portal",
    portalUrl: "https://cybercrime.gov.in",
    contactInfo: "Helpline: 1930",
    requiredEvidenceList: ["id_proof_copy", "fraudulent_document_screenshot"],
    jurisdictionNotes: "Also notify UIDAI if Aadhaar is involved.",
  },
  {
    crimeType: "social_media_hack",
    authorityName: "National Cyber Crime Reporting Portal",
    portalUrl: "https://cybercrime.gov.in",
    contactInfo: "Helpline: 1930",
    requiredEvidenceList: ["account_recovery_email", "suspicious_activity_screenshot"],
    jurisdictionNotes: "Report to the platform first, then file a complaint if unresolved.",
  },
  {
    crimeType: "other",
    authorityName: "National Cyber Crime Reporting Portal",
    portalUrl: "https://cybercrime.gov.in",
    contactInfo: "Helpline: 1930",
    requiredEvidenceList: ["any_relevant_screenshots"],
    jurisdictionNotes: "General category for unclassified cybercrime.",
  },
];

const seed = async () => {
  await connectDB();
  await RoutingAuthority.deleteMany({});
  await RoutingAuthority.insertMany(data);
  console.log(`Seeded ${data.length} routing authorities.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
