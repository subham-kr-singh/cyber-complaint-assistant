import { Navigate } from "react-router-dom";
import { FaSyncAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <FaSyncAlt className="animate-spin text-2xl text-stampRed" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
