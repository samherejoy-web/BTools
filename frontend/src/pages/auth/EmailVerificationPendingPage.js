import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';

const EmailVerificationPendingPage = () => {
  const [loading, setLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const { resendVerification } = useAuth();
  const location = useLocation();

  // Get email from location state (passed from registration)
  const email = location.state?.email || '';
  const message = location.state?.message || 'Please check your email to verify your account.';

  const handleResendVerification = async () => {
    if (!email) {
      return;
    }

    setLoading(true);
    try {
      const result = await resendVerification(email);
      if (result.success) {
        setResendCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center mb-6 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <Link to="/" className="flex justify-center items-center mb-6">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">MM</span>
            </div>
            <span className="ml-3 text-2xl font-bold text-gray-900">MarketMind</span>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Check Your Email
          </h2>
          <p className="text-gray-600">
            We've sent you a verification link
          </p>
        </div>

        {/* Email Verification Pending Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg">Verify Your Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {/* Mail Icon */}
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                Verification Email Sent!
              </p>
              <p className="text-gray-600">
                {message}
              </p>
              {email && (
                <p className="text-sm text-gray-500">
                  We sent a verification link to <span className="font-medium">{email}</span>
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-medium text-gray-900 mb-2">Next steps:</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Check your inbox for an email from MarketMind</li>
                <li>Click the verification link in the email</li>
                <li>Return here to log in to your account</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => window.open('https://mail.google.com', '_blank')}
                className="w-full btn-primary"
              >
                Open Gmail
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => window.open('https://outlook.live.com', '_blank')}
                  variant="outline"
                  className="flex-1"
                >
                  Outlook
                </Button>
                <Button
                  onClick={() => window.open('https://mail.yahoo.com', '_blank')}
                  variant="outline"
                  className="flex-1"
                >
                  Yahoo
                </Button>
              </div>
            </div>

            {/* Resend Verification */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-3">
                Didn't receive the email? Check your spam folder or
              </p>
              <Button
                onClick={handleResendVerification}
                disabled={loading || !email}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend Verification Email
                    {resendCount > 0 && ` (${resendCount})`}
                  </div>
                )}
              </Button>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Already verified your email?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            The verification link will expire in 1 hour. If you need help, please{' '}
            <Link to="/contact" className="text-blue-600 hover:text-blue-500">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPendingPage;