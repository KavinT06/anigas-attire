import Cookie from "js-cookie";

/**
 * Get access token from cookies for API authentication
 * @returns {string|null} Access token or null if not found
 */
export const getAccessToken = () => {
  return Cookie.get("accessToken") || null;
};

/**
 * Get authorization headers with Bearer token
 * @returns {Object} Headers object with Authorization if token exists
 */
export const getAuthHeaders = () => {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if access token exists
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * Logout user by clearing tokens and redirecting
 */
export const logout = () => {
  // Remove authentication cookies
  Cookie.remove("accessToken", { path: '/' });
  Cookie.remove("refreshToken", { path: '/' });
  
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.clear();
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChanged'));
    
    // Redirect to home page
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  }
};
