import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";

const inputClass =
  "w-full rounded border border-paperDim bg-white px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-stampRed";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-paperDim bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
        <p className="mb-6 mt-1 text-sm text-paperText/60">Log in to continue your complaint.</p>

        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          className={`${inputClass} mb-4`}
        />

        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          className={`${inputClass} mb-6`}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-stampRed py-2 text-white transition-colors hover:bg-stampRedDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="mt-4 text-center text-sm text-paperText/60">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-stampRed hover:text-stampRedDark">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
