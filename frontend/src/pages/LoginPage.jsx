import { useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

function LoginPage({ setPage }) {
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 const handleSubmit = (e) => {
  e.preventDefault();

  if (!form.username || !form.password) {
    setError("Please fill all fields");
    return;
  }

  setLoading(true);
  setError("");

  API.post("/login", form)
    .then((res) => {
      login(res.data.token);   // backend JWT
      setPage("dashboard");
    })
    .catch(() => {
      setError("Invalid username or password");
    })
    .finally(() => setLoading(false));
};

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* 🔵 LEFT SIDE (Branding) */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white items-center justify-center p-10">

        <div>
          <h1 className="text-4xl font-bold mb-4">
            Regulatory Tracker
          </h1>
          <p className="text-lg text-blue-100">
            Manage deadlines, track compliance, and stay ahead.
          </p>
        </div>

      </div>

      {/* ⚪ RIGHT SIDE (Login Form) */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100 p-6">

        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-sm">

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-2">
            Welcome Back 👋
          </h2>

          <p className="text-center text-gray-500 mb-6">
            Login to continue
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-100 text-red-600 p-2 text-sm rounded mb-4 text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              {loading ? "Signing in..." : "Login"}
            </button>

          </form>

          {/* Links */}
          <div className="text-center mt-5 text-sm">

            <p
              onClick={() => setPage("forgot")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Forgot Password?
            </p>

            <p className="mt-2 text-gray-600">
              New user?{" "}
              <span
                onClick={() => setPage("register")}
                className="text-blue-500 cursor-pointer hover:underline"
              >
                Create Account
              </span>
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default LoginPage;