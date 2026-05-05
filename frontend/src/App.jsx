import { useState, useContext, useEffect } from "react";
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
import AuthProvider, { AuthContext } from "./context/AuthContext";

function AppContent() {
  const { token, logout } = useContext(AuthContext);

 const getInitialPage = () => {
  const path = window.location.pathname;

  if (path === "/reset") return "reset";
  if (path === "/forgot") return "forgot";
  if (path === "/register") return "register";

  return "login";
};

const [page, setPage] = useState(getInitialPage);
  const [editData, setEditData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // ✅ AUTO LOGIN
  useEffect(() => {
    if (token) {
      setPage("dashboard");
    }
  }, [token]);

  

  const handleLogout = () => {
    logout();
    setEditData(null);
    setSelectedId(null);
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

  const isAuthPage = ["login", "register", "forgot", "reset"].includes(page);

  return (
    <div>

      {/* 🔐 AUTH PAGES */}
      {page === "login" && <LoginPage setPage={setPage} />}
      {page === "register" && <RegisterPage setPage={setPage} />}
      {page === "forgot" && <ForgotPassword setPage={setPage} />}
      {page === "reset" && <ResetPassword setPage={setPage} />}

      {/* 🌐 NAVBAR */}
      {!isAuthPage && token && (
        <div className="bg-white shadow p-4 flex justify-between items-center">

          <div className="flex gap-3">
            {navBtn("dashboard", "Dashboard")}
            {navBtn("list", "Deadlines")}
            {navBtn("analytics", "Analytics")}
          </div>

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
        <ProtectedRoute setPage={setPage}>
          <Dashboard />
        </ProtectedRoute>
      )}

      {/* 📋 LIST */}
      {page === "list" && (
        <ProtectedRoute setPage={setPage}>
          <ListPage
            setEditData={setEditData}
            setPage={setPage}
            setSelectedId={setSelectedId}
          />
        </ProtectedRoute>
      )}

      {/* 📝 FORM */}
      {page === "form" && (
        <ProtectedRoute setPage={setPage}>
          <FormPage editData={editData} setPage={setPage} />
        </ProtectedRoute>
      )}

      {/* 🔍 DETAIL */}
      {page === "detail" && selectedId && (
        <ProtectedRoute setPage={setPage}>
          <DetailPage
            id={selectedId}
            setPage={setPage}
            setEditData={setEditData}
          />
        </ProtectedRoute>
      )}

      {/* 📈 ANALYTICS */}
      {page === "analytics" && (
        <ProtectedRoute setPage={setPage}>
          <Analytics />
        </ProtectedRoute>
      )}

    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;