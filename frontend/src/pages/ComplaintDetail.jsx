import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaDownload,
  FaCheckCircle,
  FaArrowLeft,
  FaBrain,
  FaPaperPlane,
  FaExclamationCircle,
  FaClock,
  FaRegFileAlt,
  FaFolder,
  FaSyncAlt,
} from "react-icons/fa";
import { complaintApi } from "../context/ApiContext.jsx";
import EvidenceUpload from "../components/EvidenceUpload.jsx";

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    classes: "bg-amber-100 text-amber-800 border border-amber-200",
    icon: <FaClock className="inline mr-1" />,
  },
  submitted: {
    label: "Submitted",
    classes: "bg-blue-100 text-blue-800 border border-blue-200",
    icon: <FaRegFileAlt className="inline mr-1" />,
  },
  filed: {
    label: "Filed",
    classes: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    icon: <FaFolder className="inline mr-1" />,
  },
  resolved: {
    label: "Resolved",
    classes: "bg-green-100 text-green-800 border border-green-200",
    icon: <FaCheckCircle className="inline mr-1" />,
  },
};

const CRIME_LABELS = {
  upi_fraud: "UPI Fraud",
  phishing: "Phishing",
  sextortion: "Sextortion",
  cyberbullying: "Cyberbullying",
  identity_theft: "Identity Theft",
  social_media_hack: "Social Media Hack",
  other: "Other",
};

function DetailRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wider text-paperText/50">
        {label}
      </dt>
      <dd className="text-sm text-ink">{value}</dd>
    </div>
  );
}

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classifying, setClassifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchComplaint = useCallback(async () => {
    setError(null);
    try {
      const res = await complaintApi.get(id);
      setComplaint(res.data.complaint);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Complaint not found.");
      } else {
        setError("Could not load complaint. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  async function handleClassify() {
    setClassifying(true);
    try {
      const res = await complaintApi.classify(id);
      setComplaint(res.data.complaint);
      toast.success("Complaint classified by AI ✓");
    } catch (err) {
      toast.error(err.response?.data?.message || "Classification failed");
    } finally {
      setClassifying(false);
    }
  }

  async function handleSubmit() {
    if (!window.confirm("Submit this complaint? You won't be able to edit it afterwards."))
      return;
    setSubmitting(true);
    try {
      const res = await complaintApi.submit(id);
      setComplaint(res.data.complaint);
      toast.success("Complaint submitted and PDF generated ✓");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-32 animate-pulse rounded-xl border border-paperDim bg-white" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <FaExclamationCircle className="mx-auto mb-4 text-5xl text-red-400" />
        <p className="text-red-700 font-medium">{error}</p>
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={fetchComplaint}
            className="rounded-lg border border-paperDim px-4 py-2 text-sm hover:bg-paper"
          >
            Try Again
          </button>
          <Link
            to="/dashboard"
            className="rounded-lg bg-stampRed px-4 py-2 text-sm text-white hover:bg-stampRedDark"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.draft;
  const crimeLabel = complaint.crimeType
    ? CRIME_LABELS[complaint.crimeType] || complaint.crimeType.replace(/_/g, " ")
    : null;
  const isDraft = complaint.status === "draft";
  const isClassified = !!complaint.crimeType;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      {/* Back nav */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-paperText/60 transition-colors hover:text-stampRed"
      >
        <FaArrowLeft className="text-xs" />
        Back to Dashboard
      </Link>

      {/* Header card */}
      <div className="rounded-xl border border-paperDim bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-start gap-3 justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              {crimeLabel || "Unclassified Complaint"}
            </h1>
            <p className="mt-1 font-mono text-xs text-paperText/50">
              ID: {complaint._id.slice(-12).toUpperCase()} · Created{" "}
              {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${status.classes}`}
          >
            {status.icon}
            {status.label}
          </span>
        </div>

        <dl className="space-y-3 border-t border-paperDim pt-5">
          <DetailRow
            label="Description"
            value={complaint.incidentDetails?.description}
          />
          <DetailRow
            label="Platform"
            value={complaint.incidentDetails?.platform}
          />
          <DetailRow
            label="Date of Incident"
            value={
              complaint.incidentDetails?.dateOfIncident
                ? new Date(complaint.incidentDetails.dateOfIncident).toLocaleDateString(
                    "en-IN"
                  )
                : null
            }
          />
          <DetailRow
            label="Amount Lost"
            value={
              complaint.incidentDetails?.amountLost
                ? `₹${Number(complaint.incidentDetails.amountLost).toLocaleString("en-IN")}`
                : null
            }
          />
          <DetailRow
            label="Suspect Info"
            value={complaint.incidentDetails?.suspectInfo}
          />
          {complaint.crimeCategoryConfidence && (
            <DetailRow
              label="AI Confidence"
              value={`${Math.round(complaint.crimeCategoryConfidence * 100)}%`}
            />
          )}
        </dl>

        {/* AI Classification result */}
        {complaint.routedAuthority?.name && (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="flex items-center gap-2 font-semibold text-green-800">
              <FaCheckCircle />
              Routed to: {complaint.routedAuthority.name}
            </p>
            {complaint.routedAuthority.portalUrl && (
              <a
                href={complaint.routedAuthority.portalUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block text-sm text-green-700 underline hover:text-green-900"
              >
                {complaint.routedAuthority.portalUrl}
              </a>
            )}
            {complaint.routedAuthority.contactInfo && (
              <p className="mt-1 text-xs text-green-700">
                📞 {complaint.routedAuthority.contactInfo}
              </p>
            )}
          </div>
        )}

        {/* Required evidence list */}
        {complaint.requiredEvidence?.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="mb-2 font-semibold text-amber-800">Evidence required for filing:</p>
            <ul className="space-y-1">
              {complaint.requiredEvidence.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                  <span className="mt-0.5 text-amber-500">✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Evidence section */}
      <div className="rounded-xl border border-paperDim bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Evidence</h2>
        <EvidenceUpload complaintId={id} disabled={!isDraft} />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {isDraft && !isClassified && (
          <button
            onClick={handleClassify}
            disabled={classifying || !complaint.incidentDetails?.description}
            className="flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-inkPanel disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            {classifying ? (
              <>
                <FaSyncAlt className="animate-spin" /> Classifying…
              </>
            ) : (
              <>
                <FaBrain /> Classify with AI
              </>
            )}
          </button>
        )}

        {isDraft && (
          <button
            onClick={handleSubmit}
            disabled={submitting || !complaint.incidentDetails?.description}
            className="flex items-center gap-2 rounded-lg bg-stampRed px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stampRedDark disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
          >
            {submitting ? (
              <>
                <FaSyncAlt className="animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <FaPaperPlane /> Submit Complaint
              </>
            )}
          </button>
        )}

        {complaint.pdfUrl && (
          <a
            href={complaintApi.getPdfUrl(id)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg border border-stampRed px-5 py-2.5 text-sm font-semibold text-stampRed transition-colors hover:bg-stampRed/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
          >
            <FaDownload /> Download PDF
          </a>
        )}

        {complaint.generatedSummary && (
          <details className="w-full rounded-lg border border-paperDim bg-paper p-4 text-sm text-paperText/80">
            <summary className="cursor-pointer font-semibold text-ink">
              View Generated Summary
            </summary>
            <p className="mt-2 leading-relaxed">{complaint.generatedSummary}</p>
          </details>
        )}
      </div>
    </div>
  );
}
