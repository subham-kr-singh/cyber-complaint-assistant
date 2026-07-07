import { Link, useNavigate } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="flex items-center justify-between bg-ink px-4 py-4 text-white sm:px-6">
      <Link
        to="/"
        className={`flex items-center gap-2 font-sans text-lg font-semibold ${focusRing} rounded-sm`}
      >
        <FaShieldAlt className="text-brass" aria-hidden="true" />
        Cyber Complaint Assistant
      </Link>

      <div className="flex items-center gap-4 font-sans text-sm">
        {user ? (
          <>
            <Link to="/dashboard" className={`transition-colors hover:text-brass ${focusRing} rounded-sm`}>
              Dashboard
            </Link>
            <Link to="/complaints/new" className={`transition-colors hover:text-brass ${focusRing} rounded-sm`}>
              New Complaint
            </Link>
            <span className="hidden text-paper/50 sm:inline">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className={`rounded bg-stampRed px-3 py-1.5 transition-colors hover:bg-stampRedDark ${focusRing}`}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={`transition-colors hover:text-brass ${focusRing} rounded-sm`}>
              Login
            </Link>
            <Link
              to="/register"
              className={`rounded bg-stampRed px-3 py-1.5 transition-colors hover:bg-stampRedDark ${focusRing}`}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
