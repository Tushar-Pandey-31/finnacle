import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const init = useAuthStore((s) => s.init);
  const location = useLocation();

  useEffect(() => { init(); }, [init]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}