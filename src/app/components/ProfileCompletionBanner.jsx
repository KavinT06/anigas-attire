"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { checkProfileCompleteness } from '../../utils/profileApi';
import { useAuth } from '../../contexts/AuthContext';

const ProfileCompletionBanner = ({ 
  showOnPages = ['cart', 'checkout', 'wishlist'],
  currentPage = '',
  onDismiss = null 
}) => {
  const { user, isLoggedIn } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if banner should be shown on current page
  const shouldShowOnPage = showOnPages.includes(currentPage);

  useEffect(() => {
    // Only show if user is logged in and on specified pages
    if (!isLoggedIn || !shouldShowOnPage || !user) {
      setIsVisible(false);
      return;
    }

    // Check if user has dismissed banner for this session
    const dismissedKey = `profileBanner_dismissed_${currentPage}`;
    const wasDismissed = sessionStorage.getItem(dismissedKey) === 'true';
    
    if (wasDismissed) {
      setIsDismissed(true);
      setIsVisible(false);
      return;
    }

    // Check profile completeness
    const status = checkProfileCompleteness(user);
    setProfileStatus(status);

    // Show banner if profile is incomplete
    if (!status.isFullyComplete) {
      setIsVisible(true);
    }
  }, [isLoggedIn, user, currentPage, shouldShowOnPage]);

  const handleDismiss = () => {
    const dismissedKey = `profileBanner_dismissed_${currentPage}`;
    sessionStorage.setItem(dismissedKey, 'true');
    setIsDismissed(true);
    setIsVisible(false);
    
    if (onDismiss) {
      onDismiss();
    }
  };

  // Don't render if not visible or dismissed
  if (!isVisible || isDismissed || !profileStatus) {
    return null;
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Complete Your Profile</h3>
            <p className="text-sm text-gray-600">
              Add your details for a better shopping experience
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            href="/profile"
            className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
          >
            Update
          </Link>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionBanner;
