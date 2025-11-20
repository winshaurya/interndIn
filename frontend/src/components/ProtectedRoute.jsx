import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DataState } from "@/components/common/DataState";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { user, loading, getHomeRoute } = useAuth();
  const fallbackPath = `${location.pathname}${location.search}`;

  if (loading) {
    return (
      <div className="py-20">
        <DataState state="loading" message="Restoring your session" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: fallbackPath }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const destination = getHomeRoute() || "/";
    return <Navigate to={destination} replace />;
  }

  return children;
};

export default ProtectedRoute;