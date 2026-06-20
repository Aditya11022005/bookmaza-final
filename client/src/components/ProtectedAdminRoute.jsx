import { Navigate, Outlet } from 'react-router-dom';
import useAdminAuthStore from '../store/adminAuthStore';

/**
 * Guards all /admin/* routes.
 * If no admin session exists → redirect to /admin/login
 */
const ProtectedAdminRoute = () => {
  const { admin } = useAdminAuthStore();

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;
