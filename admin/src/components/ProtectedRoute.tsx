import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isLoggedIn } from "../auth";

export function ProtectedRoute() {
  const location = useLocation();
  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
