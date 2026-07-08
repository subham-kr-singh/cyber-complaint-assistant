import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaDownload, FaCheckCircle } from "react-icons/fa";
import { complaintApi } from "../context/ApiContext.jsx";
import EvidenceUpload from "../components/EvidenceUpload.jsx";

export default function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaint = useCallback(async () => {
    try {
      const res = await complaintApi.get(id);
      setComplaint(res.data.complaint);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load complaint");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await complaintApi.submit(id);
      setComplaint(res.data.complaint);
      toast.success("Complaint submitted and PDF generated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-paperText/60">Loading...</div>;
  if (!complaint) return <div className="p-8 text-center text-paperText/60">Complaint not found.</div>;

  async function handleDownloadPdf() {
    try {
      const res = await complaintApi.downloadPdf(id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `complaint_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Could not download PDF");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="rounded-lg border border-paperDim bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold text-ink">
            {complaint.crimeType ? complaint.crimeType.replace(/_/g, " ").toUpperCase() : "Complaint"}
          </h1>
          <span className="rounded-full bg-paperDim px-2 py-1 font-mono text-xs font-medium text-paperText">
            {complaint.status}
          </span>
        </div>

        <p className="mb-1 text-sm text-paperText/80">
          <span className="font-medium">Description:</span> {complaint.incidentDetails?.description}
        </p>
        <p className="mb-1 text-sm text-paperText/80">
          <span className="font-medium">Platform:</span> {complaint.incidentDetails?.platform || "N/A"}
        </p>
        <p className="mb-1 text-sm text-paperText/80">
          <span className="font-medium">Amount Lost:</span>{" "}
          {complaint.incidentDetails?.amountLost ?? "N/A"}
        </p>
        {complaint.incidentDetails?.dateOfIncident && (
          <p className="mb-1 text-sm text-paperText/80">
            <span className="font-medium">Date of Incident:</span>{" "}
            {new Date(complaint.incidentDetails.dateOfIncident).toLocaleDateString()}
          </p>
        )}
        {complaint.incidentDetails?.suspectInfo && (
          <p className="mb-1 text-sm text-paperText/80">
            <span className="font-medium">Suspect Info:</span> {complaint.incidentDetails.suspectInfo}
          </p>
        )}

        {complaint.routedAuthority?.name && (
          <div className="mt-4 rounded border border-verified/30 bg-verified/5 p-3 text-sm">
            <p className="flex items-center gap-2 font-medium text-verified">
              <FaCheckCircle aria-hidden="true" /> Routed to: {complaint.routedAuthority.name}
            </p>
            {complaint.routedAuthority.portalUrl && (
              <a
                href={complaint.routedAuthority.portalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-verified underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
              >
                {complaint.routedAuthority.portalUrl}
              </a>
            )}
          </div>
        )}

        {complaint.requiredEvidence?.length > 0 && (
          <div className="mt-4 rounded border border-brass/30 bg-brass/5 p-3 text-sm">
            <p className="mb-1 font-medium text-paperText">Required Evidence:</p>
            <ul className="list-disc pl-4 text-paperText/80">
              {complaint.requiredEvidence.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {complaint.generatedSummary && (
          <div className="mt-4 rounded border border-paperDim bg-paper p-3 text-sm text-paperText/80">
            <p className="font-medium text-paperText">Summary:</p>
            <p className="mt-1">{complaint.generatedSummary}</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-paperDim bg-white p-6">
        <h2 className="mb-3 font-display font-semibold text-ink">Evidence</h2>
        <EvidenceUpload complaintId={id} />
      </div>

      <div className="flex items-center gap-3">
        {complaint.status === "draft" && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded bg-stampRed px-5 py-2.5 text-white transition-colors hover:bg-stampRedDark disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
          >
            {submitting ? "Submitting..." : "Submit Complaint"}
          </button>
        )}

        {complaint.pdfUrl && (
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 rounded border border-stampRed px-5 py-2.5 text-stampRed transition-colors hover:bg-stampRed/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
          >
            <FaDownload aria-hidden="true" /> Download Complaint PDF
          </button>
        )}
      </div>
    </div>
  );
}
