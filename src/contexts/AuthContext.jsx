"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated } from '../utils/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Configuration flag for optional user profile endpoint
  const ENABLE_USER_PROFILE = false; // Set to true when backend has user profile endpoint

  // Check authentication status
  const checkAuthStatus = () => {
    const authStatus = isAuthenticated();
    setIsLoggedIn(authStatus);
    
    if (authStatus && !user) {
      // Set fallback user data when authenticated but no profile data
      setUser({
        id: 'user-' + Date.now(),
        name: 'User',
        phone: null,
        email: null,
        avatar: null
      });
    } else if (!authStatus) {
      setUser(null);
    }
    
    setLoading(false);
  };

  // Load user profile from backend (optional)
  const loadUserProfile = async () => {
    if (!ENABLE_USER_PROFILE || !isAuthenticated()) {
      return;
    }

    try {
      // TODO: Uncomment when backend has user profile endpoint
      // const response = await api.get('/api/auth/profile/');
      // setUser(response.data);
    } catch (error) {
      console.warn('Failed to load user profile:', error);
      // Use fallback user data
      setUser({
        id: 'user-' + Date.now(),
        name: 'User',
        phone: null,
        email: null,
        avatar: null
      });
    }
  };

  // Handle login success
  const handleLoginSuccess = (userData = null) => {
    setIsLoggedIn(true);
    setUser(userData || {
      id: 'user-' + Date.now(),
      name: 'User',
      phone: null,
      email: null,
      avatar: null
    });
    
    // Dispatch event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('authChanged'));
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    
    // Dispatch event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('authChanged'));
    }
  };

  // Initialize auth state
  useEffect(() => {
    setMounted(true);
    checkAuthStatus();
    
    if (ENABLE_USER_PROFILE) {
      loadUserProfile();
    }
  }, []);

  // Listen for auth changes from other parts of the app
  useEffect(() => {
    if (!mounted) return;

    const handleAuthChange = () => {
      checkAuthStatus();
      if (ENABLE_USER_PROFILE) {
        loadUserProfile();
      }
    };

    const handleStorageChange = () => {
      checkAuthStatus();
    };

    // Listen for custom auth change events
    window.addEventListener('authChanged', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [mounted]);

  const value = {
    isLoggedIn,
    user,
    loading,
    mounted,
    checkAuthStatus,
    handleLoginSuccess,
    handleLogout,
    // Helper methods
    getUserDisplayName: () => {
      if (!user) return 'User';
      return user.name || user.phone || 'User';
    },
    getUserAvatar: () => {
      if (user?.avatar) return user.avatar;
      // Generate avatar from first letter of name
      const name = user?.name || user?.phone || 'User';
      return name.charAt(0).toUpperCase();
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
