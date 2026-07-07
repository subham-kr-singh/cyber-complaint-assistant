import Complaint from "../models/Complaint.js";
import RoutingAuthority from "../models/RoutingAuthority.js";
import { classifyCrime } from "../utils/classifyCrime.js";
import { generateComplaintPdf } from "../utils/generatePdf.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// A minimal scripted question flow. Swap/expand this as your team builds it out.
const GUIDED_QUESTIONS = [
  "Can you describe what happened, in your own words?",
  "When did the incident occur? (date)",
  "Which platform or app was involved (e.g. UPI app, Instagram, email)?",
  "Did you lose any money? If so, how much?",
  "Do you have any information about the suspect (phone number, UPI ID, handle)?",
];

// POST /api/complaints/start
const startComplaint = asyncHandler(async (req, res, next) => {
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
  });

// POST /api/complaints/:id/answer
const answerQuestion = asyncHandler(async (req, res, next) => {
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

    complaint.emptyDraftExpiresAt = undefined;

    await complaint.save();

    const nextQuestion = GUIDED_QUESTIONS[complaint.conversation.length] || null;

    res.json({ success: true, nextQuestion, complaint });
  });

// GET /api/complaints/:id
const getComplaint = asyncHandler(async (req, res, next) => {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id }).populate(
      "evidenceIds"
    );
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    res.json({ success: true, complaint });
  });

// GET /api/complaints
const listComplaints = asyncHandler(async (req, res, next) => {
    const complaints = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  });

// PATCH /api/complaints/:id
const updateComplaint = asyncHandler(async (req, res, next) => {
    const complaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    res.json({ success: true, complaint });
  });

// DELETE /api/complaints/:id
const deleteComplaint = asyncHandler(async (req, res, next) => {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id });
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    if (complaint.status !== "draft") {
      return res.status(400).json({ success: false, message: "Only draft complaints can be deleted" });
    }
    await complaint.deleteOne();
    res.json({ success: true, message: "Complaint deleted" });
  });

// POST /api/complaints/:id/classify
const classifyComplaint = asyncHandler(async (req, res, next) => {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id });
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    const result = await classifyCrime(complaint.incidentDetails);

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
  });

// POST /api/complaints/:id/submit
const submitComplaint = asyncHandler(async (req, res, next) => {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id }).populate("evidenceIds");
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    complaint.status = "submitted";
    complaint.submittedAt = new Date();
    complaint.generatedSummary = buildSummary(complaint);

    const pdfPath = await generateComplaintPdf(complaint, req.user);
    complaint.pdfUrl = pdfPath;

    await complaint.save();
    res.json({ success: true, complaint });
  });

// GET /api/complaints/:id/summary
const getSummary = asyncHandler(async (req, res, next) => {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id });
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    res.json({ success: true, summary: complaint.generatedSummary || buildSummary(complaint) });
  });

// GET /api/complaints/:id/pdf
const downloadPdf = asyncHandler(async (req, res, next) => {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id });
    if (!complaint || !complaint.pdfUrl) {
      return res.status(404).json({ success: false, message: "PDF not generated yet" });
    }
    res.redirect(complaint.pdfUrl);
  });

// GET /api/complaints/:id/status
const getStatus = asyncHandler(async (req, res, next) => {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user._id }).select("status");
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    res.json({ success: true, status: complaint.status });
  });

// PATCH /api/complaints/:id/status  (admin only)
const updateStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    res.json({ success: true, complaint });
  });

const buildSummary = (complaint) => {
  const d = complaint.incidentDetails || {};
  return `Complaint regarding ${complaint.crimeType || "an unclassified incident"} on ${
    d.platform || "an unspecified platform"
  }. Incident: ${d.description || "N/A"}. Amount lost: ${d.amountLost ?? "N/A"}.`;
}

// GET /api/complaints/admin
const listAllComplaints = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.crimeType) {
      filter.crimeType = req.query.crimeType;
    }

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      complaints,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      }
    });
  });

export { 
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
  GUIDED_QUESTIONS,
 };
