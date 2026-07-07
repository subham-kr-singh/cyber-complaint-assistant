import Complaint from "../models/Complaint.js";
import RoutingAuthority from "../models/RoutingAuthority.js";
import { classifyCrime } from "../utils/classifyCrime.js";
import { generateComplaintPdf } from "../utils/generatePdf.js";

// A minimal scripted question flow. Swap/expand this as your team builds it out.
const GUIDED_QUESTIONS = [
  "Can you describe what happened, in your own words?",
  "When did the incident occur? (date)",
  "Which platform or app was involved (e.g. UPI app, Instagram, email)?",
  "Did you lose any money? If so, how much?",
  "Do you have any information about the suspect (phone number, UPI ID, handle)?",
];

// POST /api/complaints/start
const startComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.create({
      userId: req.user._id,
      conversation: [],
      status: "draft",
    });

    res.status(201).json({
      success: true,
      complaintId: complaint._id,
      firstQuestion: GUIDED_QUESTIONS[0],
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/complaints/:id/answer
const answerQuestion = async (req, res, next) => {
  try {
    const { question, answer } = req.body;
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id });
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    complaint.conversation.push({ question, answer });

    // naive mapping of answers into incidentDetails based on question order
    const idx = complaint.conversation.length - 1;
    if (idx === 0) complaint.incidentDetails.description = answer;
    if (idx === 1) complaint.incidentDetails.dateOfIncident = new Date(answer) || undefined;
    if (idx === 2) complaint.incidentDetails.platform = answer;
    if (idx === 3) complaint.incidentDetails.amountLost = Number(answer) || 0;
    if (idx === 4) complaint.incidentDetails.suspectInfo = answer;

    await complaint.save();

    const nextQuestion = GUIDED_QUESTIONS[complaint.conversation.length] || null;

    res.json({ success: true, nextQuestion, complaint });
  } catch (err) {
    next(err);
  }
}

// GET /api/complaints/:id
const getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id }).populate(
      "evidenceIds"
    );
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
}

// GET /api/complaints
const listComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/complaints/:id
const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/complaints/:id
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id });
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    if (complaint.status !== "draft") {
      return res.status(400).json({ success: false, message: "Only draft complaints can be deleted" });
    }
    await complaint.deleteOne();
    res.json({ success: true, message: "Complaint deleted" });
  } catch (err) {
    next(err);
  }
}

// POST /api/complaints/:id/classify
const classifyComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id });
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    const result = await classifyCrime(complaint.incidentDetails.description);

    complaint.crimeType = result.crimeType;
    complaint.crimeCategoryConfidence = result.confidence;
    if (result.requiredEvidence) complaint.requiredEvidence = result.requiredEvidence;

    // auto-route based on classified crime type
    const authority = await RoutingAuthority.findOne({ crimeType: result.crimeType });
    if (authority) {
      complaint.routedAuthority = {
        name: authority.authorityName,
        portalUrl: authority.portalUrl,
        contactInfo: authority.contactInfo,
      };
      if (!result.requiredEvidence?.length) {
        complaint.requiredEvidence = authority.requiredEvidenceList;
      }
    }

    await complaint.save();
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
}

// POST /api/complaints/:id/submit
const submitComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id });
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    complaint.status = "submitted";
    complaint.submittedAt = new Date();
    complaint.generatedSummary = buildSummary(complaint);

    const pdfPath = await generateComplaintPdf(complaint, req.user);
    complaint.pdfUrl = pdfPath;

    await complaint.save();
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
}

// GET /api/complaints/:id/summary
const getSummary = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id });
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    res.json({ success: true, summary: complaint.generatedSummary || buildSummary(complaint) });
  } catch (err) {
    next(err);
  }
}

// GET /api/complaints/:id/pdf
const downloadPdf = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id });
    if (!complaint || !complaint.pdfUrl) {
      return res.status(404).json({ success: false, message: "PDF not generated yet" });
    }
    res.redirect(complaint.pdfUrl);
  } catch (err) {
    next(err);
  }
}

// GET /api/complaints/:id/status
const getStatus = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id }).select("status");
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    res.json({ success: true, status: complaint.status });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/complaints/:id/status  (admin only)
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
}

const buildSummary = (complaint) => {
  const d = complaint.incidentDetails || {};
  return `Complaint regarding ${complaint.crimeType || "an unclassified incident"} on ${
    d.platform || "an unspecified platform"
  }. Incident: ${d.description || "N/A"}. Amount lost: ${d.amountLost ?? "N/A"}.`;
}

export { 
  startComplaint,
  answerQuestion,
  getComplaint,
  listComplaints,
  updateComplaint,
  deleteComplaint,
  classifyComplaint,
  submitComplaint,
  getSummary,
  downloadPdf,
  getStatus,
  updateStatus,
  GUIDED_QUESTIONS,
 };
