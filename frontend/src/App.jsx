import { useState } from "react";
import ListPage from "./pages/ListPage";
import FormPage from "./pages/FormPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import DetailPage from "./pages/DetailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider from "./context/AuthContext";

function App() {
  const [page, setPage] = useState("login"); // start from login
  const [editData, setEditData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  return (
    <AuthProvider>
      <div>

        {/* 🔐 LOGIN PAGE */}
        {page === "login" && <LoginPage setPage={setPage} />}

        {/* 📊 DASHBOARD */}
        {page === "dashboard" && (
          <ProtectedRoute>
            <div className="p-3">

              <button
                onClick={() => setPage("list")}
                className="bg-gray-300 px-3 py-1 mr-2"
              >
                List
              </button>

              <button
                onClick={() => setPage("login")}
                className="bg-red-400 text-white px-3 py-1"
              >
                Logout
              </button>

            </div>

            <Dashboard />
          </ProtectedRoute>
        )}

        {/* 📋 LIST PAGE */}
        {page === "list" && (
          <ProtectedRoute>
            <div className="p-3">

              <button
                onClick={() => {
                  setEditData(null);
                  setPage("form");
                }}
                className="bg-blue-500 text-white px-3 py-1 mr-2"
              >
                Add New
              </button>

              <button
                onClick={() => setPage("dashboard")}
                className="bg-green-500 text-white px-3 py-1 mr-2"
              >
                Dashboard
              </button>

              <button
                onClick={() => setPage("login")}
                className="bg-red-400 text-white px-3 py-1"
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

        {/* 📝 FORM PAGE */}
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

            <FormPage editData={editData} />
          </ProtectedRoute>
        )}

        {/* 🔍 DETAIL PAGE */}
        {page === "detail" && (
          <ProtectedRoute>
            <div className="p-3">

              <button
                onClick={() => setPage("list")}
                className="bg-gray-300 px-3 py-1"
              >
                Back to List
              </button>

            </div>

            <DetailPage
              id={selectedId}
              setPage={setPage}
              setEditData={setEditData}
            />
          </ProtectedRoute>
        )}

      </div>
    </AuthProvider>
  );
}

export default App;