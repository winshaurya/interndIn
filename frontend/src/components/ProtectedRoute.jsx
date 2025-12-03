import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DataState } from "@/components/common/DataState";
import { getRoleHome } from "@/lib/auth";
import { useEffect } from "react";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const fallbackPath = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/login", { replace: true, state: { from: fallbackPath } });
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        const destination = getRoleHome(user.role) || "/";
        navigate(destination, { replace: true });
      }
    }
  }, [isLoading, user, allowedRoles, navigate, fallbackPath]);

  if (isLoading) {
    return (
      <div className="py-20">
        <DataState state="loading" message="Restoring your session" />
      </div>
    );
  }

  if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
    return null; // Will redirect via useEffect
  }

  return children;
};

export default ProtectedRoute;
