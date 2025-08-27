import { useState, useCallback } from 'react';
import { getUserProfile, updateUserProfile, validateProfileData } from '../utils/profileApi';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for managing profile operations
 * Provides methods for fetching, updating, and validating profile data
 */
export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile
  const fetchProfile = useCallback(async (showToast = true) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getUserProfile();
      
      if (result.success) {
        setProfile(result.data);
        return result.data;
      } else {
        setError(result.error);
        if (showToast) {
          if (result.error.status === 401) {
            toast.error('Session expired. Please login again.');
          } else {
            toast.error(result.error.message || 'Failed to load profile');
          }
        }
        return null;
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch profile';
      setError({ message: errorMessage });
      if (showToast) {
        toast.error(errorMessage);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (profileData, showToast = true) => {
    try {
      setSaving(true);
      setError(null);

      // Validate data before sending
      const validation = validateProfileData(profileData);
      if (!validation.isValid) {
        if (showToast) {
          const firstError = Object.values(validation.errors)[0];
          toast.error(firstError);
        }
        return { success: false, errors: validation.errors };
      }

      const result = await updateUserProfile(profileData);
      
      if (result.success) {
        setProfile(result.data);
        if (showToast) {
          toast.success('Profile updated successfully!');
        }
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        if (showToast) {
          if (result.error.status === 401) {
            toast.error('Session expired. Please login again.');
          } else if (result.error.status === 400 && result.error.validationErrors) {
            // Handle backend validation errors
            const firstError = Object.values(result.error.validationErrors)[0];
            toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
          } else {
            toast.error(result.error.message || 'Failed to update profile');
          }
        }
        return { 
          success: false, 
          errors: result.error.validationErrors || { general: result.error.message }
        };
      }
    } catch (err) {
      const errorMessage = 'Failed to update profile';
      setError({ message: errorMessage });
      if (showToast) {
        toast.error(errorMessage);
      }
      return { success: false, errors: { general: errorMessage } };
    } finally {
      setSaving(false);
    }
  }, []);

  // Validate profile data
  const validateProfile = useCallback((profileData) => {
    return validateProfileData(profileData);
  }, []);

  // Reset profile state
  const resetProfile = useCallback(() => {
    setProfile(null);
    setError(null);
    setLoading(false);
    setSaving(false);
  }, []);

  // Get profile field value safely
  const getProfileField = useCallback((fieldName, defaultValue = '') => {
    return profile?.[fieldName] || defaultValue;
  }, [profile]);

  // Check if profile has specific field
  const hasProfileField = useCallback((fieldName) => {
    return profile && profile[fieldName] && profile[fieldName].trim() !== '';
  }, [profile]);

  return {
    // State
    profile,
    loading,
    saving,
    error,
    
    // Actions
    fetchProfile,
    updateProfile,
    validateProfile,
    resetProfile,
    
    // Helpers
    getProfileField,
    hasProfileField,
    
    // Computed values
    isProfileLoaded: profile !== null,
    hasError: error !== null
  };
};

export default useProfile;
