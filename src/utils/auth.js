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
