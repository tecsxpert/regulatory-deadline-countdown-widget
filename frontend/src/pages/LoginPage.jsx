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

    // ✅ Validation
    if (!form.username || !form.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    API.post("/login", form)
      .then((res) => {
        login(res.data.token); // save token
        setPage("list");
      })
      .catch((err) => {
        console.error(err);
        setError("Invalid username or password");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">

      <div className="bg-white shadow-lg rounded-lg p-6 w-80">

        <h2 className="text-2xl font-semibold text-center mb-4">
          Login
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Username */}
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
            className="border p-2 w-full rounded"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="border p-2 w-full rounded"
          />

          {/* Button */}
          <button
            type="submit"
            className="bg-blue-500 text-white w-full py-2 rounded"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Extra links */}
        <div className="text-center mt-3 text-sm">
          <p className="text-blue-500 cursor-pointer">
            Forgot Password?
          </p>

          <p className="mt-1 text-gray-600">
            New user? <span className="text-blue-500">Register</span>
          </p>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;