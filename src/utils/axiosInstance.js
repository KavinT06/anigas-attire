import axios from "axios";
import Cookie from "js-cookie";

// Configuration constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5025";
const REFRESH_ENDPOINT = "/api/auth/refresh/";

// Cookie configuration
const cookieOptions = {
  secure: true,
  sameSite: 'strict',
  path: '/'
};

// Token expiry times
const TOKEN_EXPIRES = {
  ACCESS: 2, // 2 days
  REFRESH: 15   // 15 days
};

// Check if running on client-side
const isClientSide = () => typeof window !== 'undefined';

// Helper function to get token based on environment
const getToken = (cookieStore = null) => {
  // Server-side: use cookieStore from Next.js
  if (cookieStore) {
    return cookieStore.get("accessToken")?.value;
  }
  
  // Client-side: use js-cookie
  if (isClientSide()) {
    return Cookie.get("accessToken");
  }
  
  return null;
};

// Helper function to get refresh token based on environment
const getRefreshToken = (cookieStore = null) => {
  // Server-side: use cookieStore from Next.js
  if (cookieStore) {
    return cookieStore.get("refreshToken")?.value;
  }
  
  // Client-side: use js-cookie
  if (isClientSide()) {
    return Cookie.get("refreshToken");
  }
  
  return null;
};

// Token management functions
const handleTokens = (access, refresh = null) => {
  // Only set cookies on client-side
  if (isClientSide()) {
    // Set access token with 2-hour expiry
    Cookie.set("accessToken", access, {
      ...cookieOptions,
      expires: TOKEN_EXPIRES.ACCESS
    });

    // Set refresh token with 30-day expiry if provided
    if (refresh) {
      Cookie.set("refreshToken", refresh, {
        ...cookieOptions,
        expires: TOKEN_EXPIRES.REFRESH
      });
    }
  }
};

const clearTokens = () => {
  // Only clear cookies on client-side
  if (isClientSide()) {
    Cookie.remove("accessToken", { path: '/' });
    Cookie.remove("refreshToken", { path: '/' });
  }
};

const handleLogout = () => {
  clearTokens();
  if (isClientSide()) {
    localStorage.clear();
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }
};

// Queue management for failed requests (shared across instances)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Create token refresh logic (reusable)
const createTokenRefreshHandler = (instance, cookieStore = null) => {
  return async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request has been retried, reject
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue the request
    if (isRefreshing) {
      try {
        const token = await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return instance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // Start refresh process
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken(cookieStore);
      
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(
        `${API_BASE_URL}${REFRESH_ENDPOINT}`,
        { refresh: refreshToken }
      );

      const { access, refresh } = response.data;
      
      // Set new tokens
      handleTokens(access, refresh);
      
      // Update instance headers
      instance.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      originalRequest.headers.Authorization = `Bearer ${access}`;

      // Process queued requests
      processQueue(null, access);
      
      return instance(originalRequest);
    } catch (err) {
      processQueue(err, null);
      handleLogout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  };
};

// Create axios instance with support for server-side cookies
const createApiInstance = (cookieStore = null) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 second timeout
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      const token = getToken(cookieStore);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor (only for client-side)
  if (isClientSide()) {
    instance.interceptors.response.use(
      (response) => response,
      createTokenRefreshHandler(instance, cookieStore)
    );
  }

  return instance;
};

// Default client-side instance
const api = createApiInstance();

export { handleTokens, clearTokens, createApiInstance };
export default api;
