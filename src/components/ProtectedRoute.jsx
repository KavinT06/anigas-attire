"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isLoggedIn, loading, mounted } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!mounted) return;

    const checkAndRedirect = () => {
      if (!loading) {
        if (!isLoggedIn) {
          // Store the current path for redirect after login
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname + window.location.search;
            sessionStorage.setItem('redirectAfterLogin', currentPath);
          }
          router.push(redirectTo);
        } else {
          setIsChecking(false);
        }
      }
    };

    checkAndRedirect();
  }, [isLoggedIn, loading, mounted, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (!mounted || loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;
