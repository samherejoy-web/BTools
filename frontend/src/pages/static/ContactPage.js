import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, MessageSquare, Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      // Submit to partnership endpoint if company is provided, otherwise general inquiry
      const endpoint = formData.company ? '/api/partnership-contact' : '/api/subscribe';
      
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          company_name: formData.company || 'General Inquiry',
          subscription_type: 'contact_form',
          source: 'contact_page'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmitted(true);
        toast.success('Message sent successfully! We\'ll get back to you soon.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact MarketMindAI",
    "url": "https://marketmindai.com/contact",
    "description": "Contact MarketMindAI for business partnerships, tool submissions, or support. Get in touch with our B2B tools directory team.",
    "mainEntity": {
      "@type": "Organization",
      "name": "MarketMindAI",
      "email": "hello@marketmindai.com",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "hello@marketmindai.com",
          "availableLanguage": "English"
        },
        {
          "@type": "ContactPoint",
          "contactType": "business partnerships",
          "email": "hello@marketmindai.com",
          "availableLanguage": "English"
        }
      ]
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact MarketMindAI - Business Partnerships & Support</title>
        <meta 
          name="description" 
          content="Contact MarketMindAI for business partnerships, tool submissions, B2B collaborations, or customer support. Reach out to our team at hello@marketmindai.com" 
        />
        <meta 
          name="keywords" 
          content="contact MarketMindAI, business partnerships, tool submissions, B2B collaboration, customer support, business tools directory" 
        />
        <meta property="og:title" content="Contact MarketMindAI - Business Partnerships & Support" />
        <meta property="og:description" content="Get in touch with MarketMindAI for partnerships, tool submissions, or support." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://marketmindai.com/contact" />
        <meta property="og:image" content="https://marketmindai.com/logo.png" />
        <link rel="canonical" href="https://marketmindai.com/contact" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Get In <span className="text-blue-600">Touch</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Ready to partner with MarketMindAI, submit a tool, or need support? 
                We'd love to hear from you and explore how we can work together.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Email Us</h3>
                <p className="text-gray-600 mb-4">
                  For general inquiries, partnerships, or support
                </p>
                <a 
                  href="mailto:hello@marketmindai.com" 
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  hello@marketmindai.com
                </a>
              </div>

              <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Partnerships</h3>
                <p className="text-gray-600 mb-4">
                  Explore collaboration opportunities and strategic partnerships
                </p>
                <a 
                  href="mailto:hello@marketmindai.com" 
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Partnership Inquiries
                </a>
              </div>

              <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Submit a Tool</h3>
                <p className="text-gray-600 mb-4">
                  Add your B2B tool to our directory and reach more customers
                </p>
                <a 
                  href="#contact-form" 
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Submit Tool
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div id="contact-form" className="max-w-3xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Send Us a Message
                  </h2>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>
                </div>

                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for reaching out. We'll get back to you soon at the email address you provided.
                    </p>
                    <button 
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: '',
                          email: '',
                          company: '',
                          subject: '',
                          message: ''
                        });
                      }}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your company name"
                        />
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                          Subject *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a subject</option>
                          <option value="partnership">Business Partnership</option>
                          <option value="tool-submission">Tool Submission</option>
                          <option value="support">Customer Support</option>
                          <option value="collaboration">Collaboration Opportunity</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tell us about your inquiry, partnership opportunity, or how we can help..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </button>

                    <p className="text-sm text-gray-500 text-center">
                      By submitting this form, you agree to our Privacy Policy and Terms of Service.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Why Partner with MarketMindAI?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
                  <div className="text-gray-600">Monthly Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">10K+</div>
                  <div className="text-gray-600">Listed B2B Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
                  <div className="text-gray-600">Partner Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;