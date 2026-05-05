import { useState } from "react";
import API from "../services/api";

function ForgotPassword({ setPage }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setMsg("Please enter email");
      return;
    }

    setLoading(true);
    setMsg("");

    // ✅ REAL BACKEND CALL
   API.post("/auth/forgot-password", {
  email: email
})
      .then(() => {
        setMsg("Reset link sent to your email");
      })
      .catch((err) => {
        if (err.response?.data?.message) {
          setMsg(err.response.data.message);
        } else {
          setMsg("Failed to send reset link");
        }
      })
      .finally(() => setLoading(false));
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
            Reset your password securely and continue managing deadlines.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100 p-6">

        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-sm">

          <h2 className="text-2xl font-bold text-center mb-3">
            Forgot Password
          </h2>

          <p className="text-center text-gray-500 mb-5">
            Enter your email to receive reset link
          </p>

          {msg && (
            <div className="bg-blue-100 text-blue-600 p-2 rounded text-sm mb-4 text-center">
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500"
            />

            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
            >
              {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;