import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaFileAlt, FaTrash } from "react-icons/fa";
import { complaintApi } from "../context/ApiContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_COLORS = {
  draft: "bg-paperDim text-paperText",
  submitted: "bg-brass/15 text-brass",
  filed: "bg-inkPanel text-paper/80",
  resolved: "bg-verified/15 text-verified",
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError("Could not load complaints. Please try again.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  async function handleDelete(e, id) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this draft? This cannot be undone.")) return;
    try {
      await complaintApi.remove(id);
      setComplaints((prev) => prev.filter((c) => c._id !== id));
      toast.success("Draft deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete complaint");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Welcome, {user?.name}</h1>
          <p className="text-sm text-paperText/60">Your cybercrime complaint history</p>
        </div>
        <Link
          to="/complaints/new"
          className="flex items-center gap-2 rounded bg-stampRed px-4 py-2 text-white transition-colors hover:bg-stampRedDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed focus-visible:ring-offset-2"
        >
          <FaPlus /> New Complaint
        </Link>
      </div>

      {loading ? (
        <p className="text-paperText/60">Loading...</p>
      ) : error ? (
        <div className="rounded-lg border border-paperDim bg-white py-10 text-center">
          <p className="mb-3 text-paperText/60">{error}</p>
          <button
            onClick={fetchComplaints}
            className="rounded bg-stampRed px-4 py-2 text-sm text-white hover:bg-stampRedDark"
          >
            Retry
          </button>
        </div>
      ) : complaints.length === 0 ? (
        <div className="rounded-lg border border-paperDim bg-white py-16 text-center">
          <FaFileAlt className="mx-auto mb-3 text-4xl text-paperDim" />
          <p className="text-paperText/60">You haven't filed any complaints yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <Link
              key={c._id}
              to={`/complaints/${c._id}`}
              className="block rounded-lg border border-paperDim bg-white p-4 transition-shadow motion-safe:hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink">
                    {c.crimeType ? c.crimeType.replace(/_/g, " ").toUpperCase() : "Not yet classified"}
                  </p>
                  <p className="font-mono text-xs text-paperText/50">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-1 font-mono text-xs font-medium ${
                      STATUS_COLORS[c.status] || "bg-paperDim text-paperText"
                    }`}
                  >
                    {c.status}
                  </span>
                  {c.status === "draft" && (
                    <button
                      onClick={(e) => handleDelete(e, c._id)}
                      className="rounded p-1 text-paperText/30 transition-colors hover:text-stampRed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
                      aria-label="Delete draft"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
