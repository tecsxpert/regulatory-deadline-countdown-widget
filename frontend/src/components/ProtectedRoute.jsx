import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);

  if (!token) {
    return <p className="text-center mt-10">Please login first</p>;
  }

  return children;
}

export default ProtectedRoute;