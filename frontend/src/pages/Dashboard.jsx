import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaFileAlt,
  FaTrash,
  FaChevronRight,
  FaShieldAlt,
  FaSyncAlt,
  FaExclamationCircle,
  FaClock,
  FaCheckCircle,
  FaRegFileAlt,
  FaFolder,
} from "react-icons/fa";
import { complaintApi } from "../context/ApiContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    classes: "bg-amber-100 text-amber-800 border border-amber-200",
    icon: <FaClock className="inline mr-1 text-amber-500" />,
  },
  submitted: {
    label: "Submitted",
    classes: "bg-blue-100 text-blue-800 border border-blue-200",
    icon: <FaRegFileAlt className="inline mr-1 text-blue-500" />,
  },
  filed: {
    label: "Filed",
    classes: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    icon: <FaFolder className="inline mr-1 text-indigo-500" />,
  },
  resolved: {
    label: "Resolved",
    classes: "bg-green-100 text-green-800 border border-green-200",
    icon: <FaCheckCircle className="inline mr-1 text-green-500" />,
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

function StatCard({ label, value, colorClass }) {
  return (
    <div className="rounded-xl border border-paperDim bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-paperText/50">{label}</p>
      <p className={`mt-1 text-3xl font-bold font-mono ${colorClass}`}>{value}</p>
    </div>
  );
}

function ComplaintCard({ complaint, onDelete }) {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.draft;
  const crimeLabel =
    complaint.crimeType
      ? CRIME_LABELS[complaint.crimeType] || complaint.crimeType.replace(/_/g, " ")
      : "Not yet classified";

  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this draft complaint? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await complaintApi.remove(complaint._id);
      toast.success("Draft deleted");
      onDelete(complaint._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete complaint");
      setDeleting(false);
    }
  }

  return (
    <div
      className="group relative block rounded-xl border border-paperDim bg-white p-5 shadow-sm transition-all duration-200 hover:border-stampRed/40 hover:shadow-md cursor-pointer"
      onClick={() => navigate(`/complaints/${complaint._id}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/complaints/${complaint._id}`)}
      aria-label={`View complaint: ${crimeLabel}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-semibold text-ink text-base">{crimeLabel}</p>
          <p className="mt-0.5 font-mono text-xs text-paperText/50">
            ID: {complaint._id.slice(-8).toUpperCase()} ·{" "}
            {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          {complaint.incidentDetails?.description && (
            <p className="mt-2 text-sm text-paperText/70 line-clamp-2">
              {complaint.incidentDetails.description}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${status.classes}`}
          >
            {status.icon}
            {status.label}
          </span>

          {complaint.status === "draft" && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded p-1.5 text-paperText/30 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
              aria-label="Delete draft"
            >
              {deleting ? (
                <FaSyncAlt className="animate-spin text-xs" />
              ) : (
                <FaTrash className="text-xs" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-3 text-xs text-paperText/50">
          {complaint.incidentDetails?.platform && (
            <span>📱 {complaint.incidentDetails.platform}</span>
          )}
          {complaint.incidentDetails?.amountLost > 0 && (
            <span>₹{complaint.incidentDetails.amountLost.toLocaleString("en-IN")} lost</span>
          )}
        </div>
        <FaChevronRight className="text-xs text-paperText/30 transition-transform group-hover:translate-x-1 group-hover:text-stampRed" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await complaintApi.list();
      setComplaints(res.data.complaints || []);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      } else {
        setError("Could not load your complaints. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  function handleDelete(id) {
    setComplaints((prev) => prev.filter((c) => c._id !== id));
  }

  const filtered =
    filter === "all" ? complaints : complaints.filter((c) => c.status === filter);

  const stats = {
    total: complaints.length,
    draft: complaints.filter((c) => c.status === "draft").length,
    submitted: complaints.filter((c) => c.status === "submitted").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            Welcome back,{" "}
            <span className="text-stampRed">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="mt-1 text-sm text-paperText/60">
            Track and manage your cybercrime complaints
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchComplaints}
            className="flex items-center gap-1.5 rounded-lg border border-paperDim bg-white px-3 py-2 text-sm text-paperText transition-colors hover:border-stampRed/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
            aria-label="Refresh complaints"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/complaints/new"
            className="flex items-center gap-2 rounded-lg bg-stampRed px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stampRedDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed focus-visible:ring-offset-2"
          >
            <FaPlus />
            New Complaint
          </Link>
        </div>
      </div>

      {/* Stats */}
      {!loading && !error && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} colorClass="text-ink" />
          <StatCard label="Drafts" value={stats.draft} colorClass="text-amber-600" />
          <StatCard label="Submitted" value={stats.submitted} colorClass="text-blue-600" />
          <StatCard label="Resolved" value={stats.resolved} colorClass="text-green-600" />
        </div>
      )}

      {/* Filter Tabs */}
      {!loading && !error && complaints.length > 0 && (
        <div className="mb-4 flex gap-1 rounded-lg border border-paperDim bg-white p-1 w-fit">
          {["all", "draft", "submitted", "filed", "resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed ${
                filter === s
                  ? "bg-ink text-white shadow-sm"
                  : "text-paperText/60 hover:text-ink"
              }`}
            >
              {s === "all" ? `All (${stats.total})` : s}
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 animate-pulse rounded-xl border border-paperDim bg-white"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-red-200 bg-red-50 py-16 text-center">
          <FaExclamationCircle className="text-4xl text-red-400" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchComplaints}
            className="rounded-lg bg-stampRed px-5 py-2 text-sm font-semibold text-white hover:bg-stampRedDark"
          >
            Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-paperDim bg-white py-20 text-center">
          {complaints.length === 0 ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-inkPanel/5">
                <FaShieldAlt className="text-3xl text-paperDim" />
              </div>
              <div>
                <p className="font-semibold text-ink">No complaints yet</p>
                <p className="mt-1 text-sm text-paperText/60">
                  Start by filing a new cybercrime complaint
                </p>
              </div>
              <Link
                to="/complaints/new"
                className="mt-2 flex items-center gap-2 rounded-lg bg-stampRed px-5 py-2.5 font-semibold text-white hover:bg-stampRedDark"
              >
                <FaPlus /> File Your First Complaint
              </Link>
            </>
          ) : (
            <>
              <FaFileAlt className="text-3xl text-paperDim" />
              <p className="text-paperText/60">No complaints match this filter</p>
              <button
                onClick={() => setFilter("all")}
                className="text-sm font-medium text-stampRed hover:text-stampRedDark"
              >
                Clear filter
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <ComplaintCard key={c._id} complaint={c} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
