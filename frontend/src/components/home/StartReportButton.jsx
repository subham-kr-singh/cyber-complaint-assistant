import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

export default function StartReportButton({ className = "", children = "Start your report" }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleClick() {
    navigate(user ? "/complaints/new" : "/register");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded bg-stampRed px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stampRedDark ${focusRing} ${className}`}
    >
      {children}
    </button>
  );
}

export { focusRing };
