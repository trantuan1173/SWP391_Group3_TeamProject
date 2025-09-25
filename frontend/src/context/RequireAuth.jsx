import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
// import LoadingSpinner from "../components/LoadingSpinner";

const RequireAuth = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  // if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;