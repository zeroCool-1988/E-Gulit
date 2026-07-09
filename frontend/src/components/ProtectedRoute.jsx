import { Navigate, useLocation } from 'react-router-dom';
import { getStoredUser } from '../api/apiClient';

export default function ProtectedRoute({ children, roles }) {
  const location = useLocation();
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}