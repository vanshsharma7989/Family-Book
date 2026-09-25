import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-4 py-5 pb-20 lg:px-8 lg:py-8 lg:pb-8 max-w-[1400px] mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
