import type { ProtectedRouteProps } from "../types";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token } = useAuth();

  return token ? children : <Navigate to="/login" replace />;
}
