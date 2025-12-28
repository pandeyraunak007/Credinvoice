import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, profileService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');

      if (storedUser && token) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);

          // Fetch fresh profile data
          const profileData = await profileService.getProfile();
          setProfile(profileData.data);
        } catch (err) {
          console.error('Failed to restore session:', err);
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authService.login(email, password);
      const { user: userData, tokens } = response.data;

      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);

      // Fetch profile
      try {
        const profileData = await profileService.getProfile();
        setProfile(profileData.data);
      } catch (profileErr) {
        // Profile might not exist yet for new users
        console.log('Profile not found, user may need to complete KYC');
      }

      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (data) => {
    setError(null);
    try {
      const response = await authService.register(data);
      const { user: userData, tokens } = response.data;

      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const profileData = await profileService.getProfile();
      setProfile(profileData.data);
      return profileData.data;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      throw err;
    }
  };

  // Helper to get KYC status from nested profile structure
  const getKycStatus = () => {
    if (!profile || !user) return null;
    switch (user.userType) {
      case 'BUYER':
        return profile.buyer?.kycStatus;
      case 'SELLER':
        return profile.seller?.kycStatus;
      case 'FINANCIER':
        return profile.financier?.kycStatus;
      default:
        return null;
    }
  };

  const kycStatus = getKycStatus();

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    isKYCComplete: kycStatus === 'APPROVED',
    isKYCPending: kycStatus === 'PENDING' || kycStatus === 'SUBMITTED' || kycStatus === 'UNDER_REVIEW',
    userType: user?.userType,
    kycStatus,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
