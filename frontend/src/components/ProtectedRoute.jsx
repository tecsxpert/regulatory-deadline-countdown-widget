import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children, setPage }) {
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) {
      setPage("login");
    }
  }, [token, setPage]);

  // ✅ Better UX instead of blank screen
  if (!token) {
    return <div>Redirecting to login...</div>;
  }

  return children;
}

export default ProtectedRoute;