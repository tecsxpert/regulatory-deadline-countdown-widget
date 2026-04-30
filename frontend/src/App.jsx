import { useState } from "react";
import ListPage from "./pages/ListPage";
import FormPage from "./pages/FormPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import DetailPage from "./pages/DetailPage";
import Analytics from "./pages/Analytics"; // ✅ Day 10
import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider from "./context/AuthContext";

function App() {
  const [page, setPage] = useState("login");
  const [editData, setEditData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // 🔴 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setPage("login");
  };

  return (
    <AuthProvider>
      <div>

        {/* 🔐 LOGIN */}
        {page === "login" && <LoginPage setPage={setPage} />}

        {/* 📊 DASHBOARD */}
        {page === "dashboard" && (
          <ProtectedRoute>
            <div className="p-3 space-x-2">

              <button
                onClick={() => setPage("list")}
                className="bg-gray-300 px-3 py-1"
              >
                List
              </button>

              <button
                onClick={() => setPage("analytics")}
                className="bg-purple-500 text-white px-3 py-1"
              >
                Analytics
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1"
              >
                Logout
              </button>

            </div>

            <Dashboard />
          </ProtectedRoute>
        )}

        {/* 📋 LIST */}
        {page === "list" && (
          <ProtectedRoute>
            <div className="p-3 space-x-2">

              <button
                onClick={() => {
                  setEditData(null);
                  setPage("form");
                }}
                className="bg-blue-500 text-white px-3 py-1"
              >
                Add New
              </button>

              <button
                onClick={() => setPage("dashboard")}
                className="bg-green-500 text-white px-3 py-1"
              >
                Dashboard
              </button>

              <button
                onClick={() => setPage("analytics")}
                className="bg-purple-500 text-white px-3 py-1"
              >
                Analytics
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1"
              >
                Logout
              </button>

            </div>

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
            <div className="p-3">

              <button
                onClick={() => setPage("list")}
                className="bg-gray-300 px-3 py-1"
              >
                Back to List
              </button>

            </div>

            <FormPage editData={editData} setPage={setPage} />
          </ProtectedRoute>
        )}

        {/* 🔍 DETAIL */}
        {page === "detail" && (
          <ProtectedRoute>
            <div className="p-3 space-x-2">

              <button
                onClick={() => setPage("list")}
                className="bg-gray-300 px-3 py-1"
              >
                Back
              </button>

              <button
                onClick={() => setPage("analytics")}
                className="bg-purple-500 text-white px-3 py-1"
              >
                Analytics
              </button>

            </div>

            <DetailPage
              id={selectedId}
              setPage={setPage}
              setEditData={setEditData}
            />
          </ProtectedRoute>
        )}

        {/* 📈 ANALYTICS (DAY 10) */}
        {page === "analytics" && (
          <ProtectedRoute>
            <div className="p-3 space-x-2">

              <button
                onClick={() => setPage("dashboard")}
                className="bg-gray-300 px-3 py-1"
              >
                Dashboard
              </button>

              <button
                onClick={() => setPage("list")}
                className="bg-green-500 text-white px-3 py-1"
              >
                List
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1"
              >
                Logout
              </button>

            </div>

            <Analytics />
          </ProtectedRoute>
        )}

      </div>
    </AuthProvider>
  );
}

export default App;