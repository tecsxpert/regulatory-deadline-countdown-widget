import { useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

function LoginPage({ setPage }) {
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    API.post("/auth/login", {
      email: form.email.trim(),
      password: form.password,
    })
      .then((res) => {
        login(res.data); // ✅ FIXED
        setPage("dashboard");
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          "Invalid email or password";
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* LEFT */}
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

      {/* RIGHT */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100 p-6">

        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-sm">

          <h2 className="text-2xl font-bold text-center mb-2">
            Welcome Back 👋
          </h2>

          <p className="text-center text-gray-500 mb-6">
            Login to continue
          </p>

          {error && (
            <div className="bg-red-100 text-red-600 p-2 text-sm rounded mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              {loading ? "Signing in..." : "Login"}
            </button>

          </form>

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