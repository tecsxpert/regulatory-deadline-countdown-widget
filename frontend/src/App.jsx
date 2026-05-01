import { useState } from "react";
import ListPage from "./pages/ListPage";
import FormPage from "./pages/FormPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import DetailPage from "./pages/DetailPage";
import Analytics from "./pages/Analytics";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider from "./context/AuthContext";

function App() {
  const [page, setPage] = useState("login");
  const [editData, setEditData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setPage("login");
  };

  const navBtn = (name, label) => (
    <button
      onClick={() => setPage(name)}
      className={`px-4 py-2 rounded-lg transition ${
        page === name
          ? "bg-blue-600 text-white"
          : "bg-gray-200 hover:bg-gray-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <AuthProvider>
      <div>

        {/* 🔐 AUTH PAGES */}
        {page === "login" && <LoginPage setPage={setPage} />}
        {page === "register" && <RegisterPage setPage={setPage} />}
        {page === "forgot" && <ForgotPassword setPage={setPage} />}
        {page === "reset" && <ResetPassword setPage={setPage} />}

        {/* 🌐 NAVBAR */}
        {!["login", "register", "forgot", "reset"].includes(page) && (
          <div className="bg-white shadow p-4 flex justify-between items-center">

            {/* LEFT NAV */}
            <div className="flex gap-3">
              {navBtn("dashboard", "Dashboard")}
              {navBtn("list", "Deadlines")}
              {navBtn("analytics", "Analytics")}
            </div>

            {/* RIGHT LOGOUT */}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>

          </div>
        )}

        {/* 📊 DASHBOARD */}
        {page === "dashboard" && (
          <ProtectedRoute>
            <Dashboard setPage={setPage} />
          </ProtectedRoute>
        )}

        {/* 📋 LIST */}
        {page === "list" && (
          <ProtectedRoute>
            <ListPage
              setEditData={setEditData}
              setPage={setPage}
              setSelectedId={setSelectedId}
            />
          </ProtectedRoute>
        )}

        {/* 📝 FORM */}
        {page === "form" && (
          <ProtectedRoute>
            <FormPage editData={editData} setPage={setPage} />
          </ProtectedRoute>
        )}

        {/* 🔍 DETAIL */}
        {page === "detail" && (
          <ProtectedRoute>
            <DetailPage
              id={selectedId}
              setPage={setPage}
              setEditData={setEditData}
            />
          </ProtectedRoute>
        )}

        {/* 📈 ANALYTICS */}
        {page === "analytics" && (
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        )}

      </div>
    </AuthProvider>
  );
}

export default App;