"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useProfile } from '../../hooks/useProfile';

const ProfilePage = () => {
  const { isLoggedIn, loading: authLoading, loadUserProfile, user } = useAuth();
  const { 
    profile, 
    getProfileField 
  } = useProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Helper function to get stored address
  const getStoredAddress = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userAddress') || 'Not provided';
    }
    return 'Not provided';
  };

  // Helper function to get phone number from profile or user data
  const getPhoneNumber = () => {
    // Try multiple possible field names for phone number
    let phoneNumber = getProfileField('phone_number') || 
                     getProfileField('phone') || 
                     getProfileField('mobile') ||
                     user?.phone_number || 
                     user?.phone || 
                     user?.mobile;
    
    // If no phone number found from API, try localStorage (stored during login)
    if (!phoneNumber || phoneNumber === 'Not provided') {
      if (typeof window !== 'undefined') {
        phoneNumber = localStorage.getItem('userPhone') || 
                     sessionStorage.getItem('userPhone') ||
                     'Not provided';
      }
    }
    
    return phoneNumber;
  };

  // Handle form input changes - simplified
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Save profile changes - simplified without backend profile API
  const handleSaveProfile = async () => {
    // Simple validation for address only
    if (!formData.address || formData.address.trim() === '') {
      setErrors({ address: 'Address is required' });
      return;
    }

    // For now, just store in localStorage since backend profile endpoint doesn't exist
    try {
      setSaving(true);
      
      // Store address in localStorage
      localStorage.setItem('userAddress', formData.address);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      setErrors({});
      
    } catch (error) {
      console.error('Error saving address:', error);
      setErrors({ address: 'Failed to save address. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing - simplified
  const handleCancelEdit = () => {
    // Reset to stored address from localStorage
    const storedAddress = typeof window !== 'undefined' ? localStorage.getItem('userAddress') || '' : '';
    setFormData({
      address: storedAddress
    });
    setErrors({});
    setIsEditing(false);
  };

  // Load profile on component mount
  useEffect(() => {
    if (isLoggedIn && !authLoading) {
      // Skip profile API calls that cause 404 errors
      // Only load user data from AuthContext if available
      if (loadUserProfile) {
        loadUserProfile().catch(error => {
          // Silently handle profile loading errors
        });
      }
      
      // Initialize form with empty address (no API call needed)
      setFormData({
        address: ''
      });
    } else if (!authLoading && !isLoggedIn) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  }, [isLoggedIn, authLoading, loadUserProfile]);

  // Update form data when profile loads - simplified without API dependency
  useEffect(() => {
    // Load stored address from localStorage
    const storedAddress = typeof window !== 'undefined' ? localStorage.getItem('userAddress') || '' : '';
    setFormData({
      address: storedAddress
    });
  }, []);

  // Show loading state only for auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-green-50 to-green-100 min-h-screen">
      {/* Main Container */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Section - Centered */}
          <div className="text-center mb-8 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
              Address Settings
            </h1>
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
              Manage your delivery address information
            </p>
          </div>

          {/* Profile Card - Responsive */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            {!isEditing ? (
              /* View Mode - Responsive Layout */
              <div className="p-6 sm:p-8 lg:p-10">
                
                {/* Profile Header - Responsive Flex */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-gray-200 space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl lg:text-2xl font-bold shadow-lg">
                      {getProfileField('name') ? getProfileField('name').charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">
                        {getPhoneNumber() !== 'Not provided' ? getPhoneNumber() : 'User Profile'}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">Address Information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit Address
                  </button>
                </div>

                {/* Profile Information Grid - Simplified */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  <div className="bg-gray-50 rounded-lg p-4 lg:p-6 border border-gray-100">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 block">
                      Phone Number
                    </label>
                    <p className="text-lg lg:text-xl text-black font-medium break-words">
                      {getPhoneNumber()}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 lg:p-6 border border-gray-100">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 block">
                      Address
                    </label>
                    <p className="text-lg lg:text-xl text-black font-medium break-words">
                      {getStoredAddress()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode - Responsive Layout */
              <div className="p-6 sm:p-8 lg:p-10">
                
                {/* Edit Header - Centered */}
                <div className="text-center mb-8 pb-6 border-b border-gray-200">
                  <h3 className="text-2xl sm:text-3xl font-bold text-black mb-2">Edit Address</h3>
                  <p className="text-sm sm:text-base text-gray-600">Update your delivery address</p>
                </div>
                
                {/* Form Grid - Address Only */}
                <div className="max-w-2xl mx-auto">
                  <div className="space-y-6 lg:space-y-8">
                    
                    {/* Phone Number Field - Display Only */}
                    <div>
                      <label className="block text-sm sm:text-base font-bold text-black mb-3">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={getPhoneNumber()}
                        disabled
                        className="w-full px-4 py-3 lg:py-4 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-base lg:text-lg cursor-not-allowed"
                        placeholder="Phone number will appear here"
                      />
                      <p className="text-xs sm:text-sm text-gray-500 mt-2 flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-1" />
                        Phone number cannot be changed
                      </p>
                    </div>

                    {/* Address Field - Editable */}
                    <div>
                      <label className="block text-sm sm:text-base font-bold text-black mb-3">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, address: e.target.value }));
                          if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                        }}
                        rows={4}
                        className={`w-full px-4 py-3 lg:py-4 border-2 rounded-lg text-base lg:text-lg focus:outline-none focus:ring-0 resize-none transition-all duration-200 ${
                          errors.address 
                            ? 'border-red-300 bg-red-50 focus:border-red-500' 
                            : 'border-gray-300 focus:border-orange-500 hover:border-gray-400'
                        }`}
                        placeholder="Enter your complete address"
                      />
                      {errors.address && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Responsive */}
                  <div className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-10 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="w-full sm:w-auto px-8 py-3 lg:py-4 border-2 border-gray-300 rounded-lg text-base font-semibold text-black bg-white hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="w-full sm:w-auto px-8 py-3 lg:py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      {saving ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <CheckIcon className="w-4 h-4 mr-2" />
                          Save Changes
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
