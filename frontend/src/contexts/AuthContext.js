import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import apiClient from '../utils/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      // Token is invalid, remove it
      localStorage.removeItem('token');
      toast.error('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });

      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      // New response format - no auto-login, verification required
      const { message, email, verification_required } = response.data;
      
      toast.success(message || 'Registration successful! Please check your email to verify your account.');
      return { 
        success: true, 
        verification_required: verification_required || true,
        email: email,
        message: message
      };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const verifyEmail = async (token) => {
    try {
      const response = await apiClient.post(`/auth/verify-email/${token}`);
      toast.success(response.data.message || 'Email verified successfully!');
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.detail || 'Email verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyOTP = async (email, otpCode) => {
    try {
      const response = await apiClient.post('/auth/verify-otp', { 
        email, 
        otp_code: otpCode 
      });
      toast.success(response.data.message || 'Email verified successfully with OTP!');
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.detail || 'OTP verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resendVerification = async (email, method = 'both') => {
    try {
      const response = await apiClient.post('/auth/resend-verification', { 
        email, 
        method 
      });
      toast.success(response.data.message || 'Verification email sent successfully!');
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to send verification email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const getVerificationStatus = async (email) => {
    try {
      const response = await apiClient.get(`/auth/verification-status/${email}`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to get verification status';
      return { success: false, error: message };
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    verifyEmail,
    verifyOTP,
    resendVerification,
    getVerificationStatus,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isSuperAdmin: user?.role === 'superadmin',
    isUser: user?.role === 'user'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};