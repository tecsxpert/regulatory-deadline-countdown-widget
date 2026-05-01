import { useState, useEffect } from "react";
import API from "../services/api";

function ResetPassword({ setPage }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");

    if (!t) {
      setMsg("Invalid reset link");
      return;
    }

    setToken(t);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!password || !confirm) {
      setMsg("All fields required");
      return;
    }

    if (password !== confirm) {
      setMsg("Passwords do not match");
      return;
    }

    API.post("/auth/reset-password", {
      token,
      password,
    })
      .then(() => {
        alert("Password updated successfully");
        setPage("login");
      })
      .catch(() => setMsg("Invalid or expired token"));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white items-center justify-center p-10">
        <div>
          <h1 className="text-4xl font-bold mb-4">
            Regulatory Tracker
          </h1>
          <p className="text-lg text-blue-100">
            Set a new password to secure your account.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100 p-6">

        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-sm">

          <h2 className="text-2xl font-bold text-center mb-3">
            Reset Password
          </h2>

          <p className="text-center text-gray-500 mb-5">
            Enter your new password
          </p>

          {msg && (
            <div className="bg-red-100 text-red-600 p-2 rounded text-sm mb-4 text-center">
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500"
            />

            <button className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700">
              Update Password
            </button>

          </form>

          <p
            onClick={() => setPage("login")}
            className="text-center mt-4 text-blue-500 cursor-pointer hover:underline"
          >
            Back to Login
          </p>

        </div>

      </div>
    </div>
  );
}

export default ResetPassword;