import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleHome } from "@/lib/auth";
import { DataState } from "@/components/common/DataState";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="py-20">
        <DataState state="loading" message="Checking your session" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return children;
};

export default PublicRoute;
