import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function AccessRoute({ children, allowedRoles = [], requireVerified = false, redirectTo = "/" }) {
  const location = useLocation();
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate replace state={{ from: location }} to="/auth" />;
  }

  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate replace to={redirectTo} />;
  }

  if (user && requireVerified && !(user.is_verified ?? user.isVerified)) {
    return <Navigate replace to="/profile" />;
  }

  return children;
}