import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, MapPin, Phone, Clock, Send, MessageSquare, Users, Headphones } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import apiClient from '../../utils/apiClient';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    inquiry_type: 'general'
  });
  const [loading, setLoading] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Here you would typically send the form data to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Thank you for your message! We\'ll get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        inquiry_type: 'general'
      });
    } catch (error) {
      toast.error('There was an error sending your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact MarketMind AI - Get Support & Business Inquiries</title>
        <meta name="description" content="Contact MarketMind AI for business inquiries, partnership opportunities, technical support, and general questions. We're here to help you succeed." />
        <meta name="keywords" content="contact marketmind, support, business inquiries, partnerships, customer service, help center" />
        <meta property="og:title" content="Contact MarketMind AI - Get Support & Business Inquiries" />
        <meta property="og:description" content="Reach out to MarketMind AI for support, partnerships, or any questions about our platform." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${process.env.REACT_APP_BACKEND_URL}/contact`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">MarketMind AI</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                We're here to help you succeed. Reach out for support, partnerships, 
                or to learn more about how MarketMind AI can transform your business tool discovery process.
              </p>
            </div>
          </div>
        </div>

        <div className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Whether you're looking for support, exploring partnership opportunities, or have questions about our platform, 
                  we'd love to hear from you. Our team is dedicated to providing exceptional service and support.
                </p>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Email Support</h3>
                      <p className="text-gray-600 mb-2">For general inquiries and support</p>
                      <a href="mailto:support@marketmind.ai" className="text-blue-600 hover:text-blue-700 font-medium">
                        support@marketmind.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Business Partnerships</h3>
                      <p className="text-gray-600 mb-2">Partnership and integration opportunities</p>
                      <a href="mailto:partnerships@marketmind.ai" className="text-blue-600 hover:text-blue-700 font-medium">
                        partnerships@marketmind.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Headphones className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Technical Support</h3>
                      <p className="text-gray-600 mb-2">Platform issues and technical assistance</p>
                      <a href="mailto:tech@marketmind.ai" className="text-blue-600 hover:text-blue-700 font-medium">
                        tech@marketmind.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Response Time</h3>
                      <p className="text-gray-600">We typically respond within 24 hours during business days</p>
                    </div>
                  </div>
                </div>

                {/* Contact Methods */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-600">Live chat available on our platform (for registered users)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-purple-600" />
                      <span className="text-gray-600">Join our community discussions and forums</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company (Optional)
                    </label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Enter your company name"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="inquiry_type" className="block text-sm font-medium text-gray-700 mb-2">
                      Inquiry Type
                    </label>
                    <select
                      id="inquiry_type"
                      name="inquiry_type"
                      value={formData.inquiry_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                      <option value="press">Press Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief description of your inquiry"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please provide details about your inquiry..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-xs text-gray-500 mt-4">
                  * Required fields. We respect your privacy and will never share your information with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">
                Find quick answers to common questions about MarketMind AI
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I submit a new tool for review?</h3>
                <p className="text-gray-600">
                  You can submit tools for review through your dashboard or by contacting our partnerships team. 
                  We review all submissions and add qualifying tools to our database.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is MarketMind AI free to use?</h3>
                <p className="text-gray-600">
                  Yes, basic access to our tool directory and reviews is free. Premium features and advanced 
                  analytics are available with our subscription plans.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do you ensure review authenticity?</h3>
                <p className="text-gray-600">
                  We use a combination of AI algorithms and manual moderation to verify review authenticity. 
                  All reviewers must be verified users with confirmed business affiliations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;