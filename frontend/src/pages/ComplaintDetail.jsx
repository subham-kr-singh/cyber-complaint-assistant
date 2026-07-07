import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaDownload, FaCheckCircle } from "react-icons/fa";
import { complaintApi } from "../context/ApiContext.jsx";
import EvidenceUpload from "../components/EvidenceUpload.jsx";

export default function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  async function fetchComplaint() {
    try {
      const res = await complaintApi.get(id);
      setComplaint(res.data.complaint);
    } catch (err) {
      toast.error("Could not load complaint");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    try {
      const res = await complaintApi.submit(id);
      setComplaint(res.data.complaint);
      toast.success("Complaint submitted and PDF generated");
    } catch (err) {
      toast.error("Submission failed");
    }
  }

  if (loading) return <div className="p-8 text-center text-paperText/60">Loading...</div>;
  if (!complaint) return <div className="p-8 text-center text-paperText/60">Complaint not found.</div>;

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

        {complaint.routedAuthority?.name && (
          <div className="mt-4 rounded border border-verified/30 bg-verified/5 p-3 text-sm">
            <p className="flex items-center gap-2 font-medium text-verified">
              <FaCheckCircle aria-hidden="true" /> Routed to: {complaint.routedAuthority.name}
            </p>
            <a
              href={complaint.routedAuthority.portalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-verified underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
            >
              {complaint.routedAuthority.portalUrl}
            </a>
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
            className="rounded bg-stampRed px-5 py-2.5 text-white transition-colors hover:bg-stampRedDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
          >
            Submit Complaint
          </button>
        )}

        {complaint.pdfUrl && (
          <a
            href={complaintApi.getPdfUrl(id)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded border border-stampRed px-5 py-2.5 text-stampRed transition-colors hover:bg-stampRed/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
          >
            <FaDownload aria-hidden="true" /> Download Complaint PDF
          </a>
        )}
      </div>
    </div>
  );
}
