import { useEffect, useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MotherProfile } from './pages/MotherProfile';
import { ProtectedRoute } from './components/ProtectedRoute';

export function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (currentPath === '/login' || currentPath === '/') {
    return <Login />;
  }

  if (currentPath === '/dashboard') {
    return (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    );
  }

  if (currentPath.startsWith('/mother/')) {
    return (
      <ProtectedRoute>
        <MotherProfile />
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">404 - Page Not Found</h1>
        <a href="/login" className="text-teal-600 hover:underline">
          Go to Login
        </a>
      </div>
    </div>
  );
}
