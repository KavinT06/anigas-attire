import api from './axiosInstance';

/**
 * Profile API utilities for interacting with Django backend
 * Note: Since /api/profile/ endpoint doesn't exist in your backend,
 * this uses fallback approaches or minimal data structures
 */

/**
 * Get user profile data
 * @returns {Promise} Profile data from backend
 */
export const getUserProfile = async () => {
  // Use localStorage for profile data
  let localProfile = {
    address: '',
    phone_number: null,
    phone: null,
    mobile: null,
    name: 'User',
    email: null
  };
  
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('userProfile');
    if (stored) {
      try {
        localProfile = { ...localProfile, ...JSON.parse(stored) };
      } catch (e) {
        console.error('Error parsing stored profile data:', e);
      }
    }
    
    // Also check for phone number stored during login
    const storedPhone = localStorage.getItem('userPhone');
    if (storedPhone) {
      localProfile.phone_number = storedPhone;
      localProfile.phone = storedPhone;
    }
  }
  
  return {
    success: true,
    data: localProfile,
    error: null
  };
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
    // Since /api/profile/ endpoint doesn't exist in your backend,
    // we'll store the data locally and return success
    // You can implement backend profile update when the endpoint is available
    
    // Store locally for now
    if (typeof window !== 'undefined') {
      localStorage.setItem('userProfile', JSON.stringify({
        name: profileData.name,
        email: profileData.email,
        address: profileData.address,
        updated_at: new Date().toISOString()
      }));
    }

    return {
      success: true,
      data: {
        name: profileData.name,
        email: profileData.email,
        address: profileData.address,
        message: 'Profile data saved locally. Backend profile endpoint not available.'
      },
      error: null
    };
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return {
      success: false,
      data: null,
      error: {
        status: 500,
        message: 'Failed to save profile data locally',
        data: error.message
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
 * Note: These endpoints are not available in your current backend
 * They are kept for reference if you decide to implement them later
 */
export const PROFILE_ENDPOINTS = {
  // These endpoints don't exist in your backend - for future reference only
  GET_PROFILE: '/api/profile/', // Not implemented
  UPDATE_PROFILE: '/api/profile/', // Not implemented
  // Future endpoints if you decide to add profile functionality
  UPLOAD_AVATAR: '/api/profile/avatar/', // Not implemented
  CHANGE_PASSWORD: '/api/profile/change-password/', // Not implemented
  DELETE_ACCOUNT: '/api/profile/delete-account/' // Not implemented
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
