import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { CheckCircle, XCircle, Mail, ArrowLeft, RotateCcw } from 'lucide-react';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      handleVerification();
    } else {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
    }
  }, [token]);

  const handleVerification = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const result = await verifyEmail(token);
      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Your email has been verified successfully!');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.error || 'Verification failed. The link may be invalid or expired.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (token) {
      setStatus('verifying');
      setMessage('');
      handleVerification();
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
            Email Verification
          </h2>
        </div>

        {/* Verification Status Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg">
              {status === 'verifying' && 'Verifying your email...'}
              {status === 'success' && 'Verification Successful!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {/* Verifying State */}
            {status === 'verifying' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Email Verified Successfully!
                  </p>
                  <p className="text-gray-600">
                    {message}
                  </p>
                  <p className="text-sm text-gray-500">
                    You will be redirected to the login page in a few seconds...
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full btn-primary"
                  >
                    Go to Login
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="w-full"
                  >
                    Go to Home
                  </Button>
                </div>
              </div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <XCircle className="h-16 w-16 text-red-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Verification Failed
                  </p>
                  <p className="text-gray-600">
                    {message}
                  </p>
                  <p className="text-sm text-gray-500">
                    The verification link may be invalid, expired, or already used.
                  </p>
                </div>
                <div className="space-y-3">
                  {token && (
                    <Button
                      onClick={handleRetry}
                      disabled={loading}
                      className="w-full btn-primary"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Retrying...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Try Again
                        </div>
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    variant="outline"
                    className="w-full"
                  >
                    Register Again
                  </Button>
                </div>
              </div>
            )}

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Having trouble? Check your email for the verification link or{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-500">
                  try logging in
                </Link>{' '}
                to resend the verification email.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerificationPage;