import React, { useState } from 'react';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';

const NewsletterForm = ({ 
  source = "website", 
  placeholder = "Enter your email",
  buttonText = "Subscribe",
  className = "",
  inputClassName = "",
  buttonClassName = "",
  onSuccess = null,
  onError = null
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/newsletter/subscribe', {
        email: email.trim().toLowerCase(),
        source: source
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Successfully subscribed to newsletter!');
        setEmail(''); // Clear form
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        throw new Error(response.data.message || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      
      let errorMessage = 'There was an error processing your subscription. Please try again.';
      
      // Handle validation errors from backend
      if (error.response?.status === 422 && error.response?.data?.detail) {
        const errorDetails = error.response.data.detail;
        if (Array.isArray(errorDetails)) {
          errorMessage = errorDetails.map(detail => `${detail.loc[1]}: ${detail.msg}`).join(', ');
        } else {
          errorMessage = errorDetails;
        }
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      toast.error(errorMessage);
      
      // Call error callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className} data-testid="newsletter-form">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          data-testid="newsletter-email-input"
          className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${inputClassName} ${
            loading ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
        <button
          type="submit"
          disabled={loading}
          data-testid="newsletter-submit-button"
          className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap ${buttonClassName}`}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Subscribing...
            </div>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </form>
  );
};

export default NewsletterForm;