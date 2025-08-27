import api from './axiosInstance';

/**
 * Profile API utilities for interacting with Django backend
 * Base URL: /api/profile/
 */

/**
 * Get user profile data
 * @returns {Promise} Profile data from backend
 */
export const getUserProfile = async () => {
  try {
    // Try the profile endpoint first
    const response = await api.get('/api/profile/');
    return {
      success: true,
      data: response.data,
      error: null
    };
  } catch (error) {
    // If profile endpoint doesn't exist (404), try alternative approaches
    if (error.response?.status === 404) {
      // Try to get user info from auth endpoint or use stored data
      try {
        // Option 1: Try auth/me or similar endpoint
        const authResponse = await api.get('/api/auth/me/');
        return {
          success: true,
          data: authResponse.data,
          error: null
        };
      } catch (authError) {
        // Option 2: Return minimal data structure for address-only functionality
        // Since we only need address, we can work with minimal profile data
        return {
          success: true,
          data: {
            // Minimal structure for address functionality
            address: '', // Empty address that user can fill
            phone_number: null, // Will be handled separately
            phone: null,
            mobile: null
          },
          error: null
        };
      }
    }
    
    // For other errors, return the original error response
    return {
      success: false,
      data: null,
      error: {
        status: error.response?.status,
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to fetch profile',
        data: error.response?.data
      }
    };
  }
};

/**
 * Update user profile data
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.name - User's full name
 * @param {string} profileData.email - User's email address  
 * @param {string} profileData.address - User's address
 * @returns {Promise} Updated profile data from backend
 */
export const updateUserProfile = async (profileData) => {
  try {
    // Prepare data for backend (remove any read-only fields)
    const updateData = {
      name: profileData.name,
      email: profileData.email,
      address: profileData.address
    };

    const response = await api.put('/api/profile/', updateData);
    return {
      success: true,
      data: response.data,
      error: null
    };
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return {
      success: false,
      data: null,
      error: {
        status: error.response?.status,
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to update profile',
        data: error.response?.data,
        validationErrors: error.response?.status === 400 ? error.response.data : null
      }
    };
  }
};

/**
 * Validate profile data before sending to backend
 * @param {Object} profileData - Profile data to validate
 * @returns {Object} Validation result with errors if any
 */
export const validateProfileData = (profileData) => {
  const errors = {};

  // Name validation
  if (!profileData.name || !profileData.name.trim()) {
    errors.name = 'Name is required';
  } else if (profileData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  } else if (profileData.name.trim().length > 100) {
    errors.name = 'Name must be less than 100 characters';
  }

  // Email validation (optional field)
  if (profileData.email && profileData.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    } else if (profileData.email.trim().length > 254) {
      errors.email = 'Email address is too long';
    }
  }

  // Address validation (optional field)
  if (profileData.address && profileData.address.trim() && profileData.address.trim().length > 500) {
    errors.address = 'Address must be less than 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format profile data for display
 * @param {Object} profileData - Raw profile data from backend
 * @returns {Object} Formatted profile data
 */
export const formatProfileData = (profileData) => {
  if (!profileData) return null;

  return {
    name: profileData.name || '',
    phone_number: profileData.phone_number || profileData.phone || '',
    email: profileData.email || '',
    address: profileData.address || '',
    // Additional fields that might come from backend
    id: profileData.id,
    created_at: profileData.created_at,
    updated_at: profileData.updated_at,
    is_verified: profileData.is_verified || false
  };
};

/**
 * Check if profile is complete (has all required fields)
 * @param {Object} profileData - Profile data to check
 * @returns {Object} Completion status and missing fields
 */
export const checkProfileCompleteness = (profileData) => {
  const requiredFields = ['name'];
  const recommendedFields = ['email', 'address'];
  
  const missingRequired = requiredFields.filter(field => 
    !profileData[field] || !profileData[field].trim()
  );
  
  const missingRecommended = recommendedFields.filter(field => 
    !profileData[field] || !profileData[field].trim()
  );

  return {
    isComplete: missingRequired.length === 0,
    isFullyComplete: missingRequired.length === 0 && missingRecommended.length === 0,
    missingRequired,
    missingRecommended,
    completionPercentage: Math.round(
      ((requiredFields.length + recommendedFields.length - missingRequired.length - missingRecommended.length) / 
       (requiredFields.length + recommendedFields.length)) * 100
    )
  };
};

/**
 * Profile API endpoints configuration
 * Useful for reference and potential future endpoints
 */
export const PROFILE_ENDPOINTS = {
  GET_PROFILE: '/api/profile/',
  UPDATE_PROFILE: '/api/profile/',
  // Future endpoints
  UPLOAD_AVATAR: '/api/profile/avatar/',
  CHANGE_PASSWORD: '/api/profile/change-password/',
  DELETE_ACCOUNT: '/api/profile/delete-account/'
};

/**
 * Profile field configurations
 * Useful for form generation and validation
 */
export const PROFILE_FIELDS = {
  name: {
    label: 'Full Name',
    type: 'text',
    required: true,
    maxLength: 100,
    placeholder: 'Enter your full name'
  },
  phone_number: {
    label: 'Phone Number',
    type: 'tel',
    required: false,
    readonly: true,
    placeholder: 'Phone number'
  },
  email: {
    label: 'Email Address',
    type: 'email',
    required: false,
    maxLength: 254,
    placeholder: 'Enter your email address'
  },
  address: {
    label: 'Address',
    type: 'textarea',
    required: false,
    maxLength: 500,
    placeholder: 'Enter your address'
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  validateProfileData,
  formatProfileData,
  checkProfileCompleteness,
  PROFILE_ENDPOINTS,
  PROFILE_FIELDS
};
