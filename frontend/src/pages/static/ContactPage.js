import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Clock, Send, MessageSquare, Users, Headphones } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import EnhancedSEOHead from '../../components/SEO/EnhancedSEOHead';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FAQ from '../../components/ui/FAQ';
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
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Please enter your name');
        return;
      }
      if (!formData.email.trim()) {
        toast.error('Please enter your email address');
        return;
      }
      if (!formData.subject.trim()) {
        toast.error('Please enter a subject');
        return;
      }
      if (!formData.message.trim()) {
        toast.error('Please enter your message');
        return;
      }

      // Submit to backend API
      const response = await apiClient.post('/contact', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: formData.company.trim() || null,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        inquiry_type: formData.inquiry_type
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Thank you for your message! We\'ll get back to you within 24 hours.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          subject: '',
          message: '',
          inquiry_type: 'general'
        });
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      
      // Handle validation errors from backend
      if (error.response?.status === 422 && error.response?.data?.detail) {
        const errorDetails = error.response.data.detail;
        if (Array.isArray(errorDetails)) {
          errorDetails.forEach(detail => {
            toast.error(`${detail.loc[1]}: ${detail.msg}`);
          });
        } else {
          toast.error(errorDetails);
        }
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('There was an error sending your message. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // FAQ data for AEO optimization
  const faqs = [
    {
      question: "How can I contact MarketMindAI support?",
      answer: "You can contact MarketMindAI support through multiple channels: email us at support@marketmind.ai for general inquiries and support, use our contact form on this page for detailed questions, or reach out via live chat (available for registered users). We typically respond within 24 hours during business days."
    },
    {
      question: "What is the best way to report a technical issue?",
      answer: "For technical issues, please email tech@marketmind.ai or use the contact form above and select 'Technical Support' as the inquiry type. Include details about the issue, your browser/device information, and steps to reproduce the problem. Our technical team will investigate and respond promptly."
    },
    {
      question: "How do I submit a new tool for review?",
      answer: "You can submit tools for review through your dashboard or by contacting our partnerships team at partnerships@marketmind.ai. We review all submissions and add qualifying tools to our database within 3-5 business days. Include tool details, website URL, and key features in your submission."
    },
    {
      question: "Does MarketMindAI offer partnership opportunities?",
      answer: "Yes! We're always interested in partnerships, integrations, and collaboration opportunities. Contact our partnerships team at partnerships@marketmind.ai to discuss tool vendor partnerships, affiliate programs, content collaborations, API integrations, and other business opportunities."
    },
    {
      question: "How quickly will I receive a response to my inquiry?",
      answer: "We strive to respond to all inquiries within 24 hours during business days (Monday-Friday). For urgent technical issues or billing questions, we prioritize responses and typically reply within 12 hours. Complex inquiries may take longer, but we'll acknowledge receipt and provide an estimated response time."
    },
    {
      question: "Can I schedule a demo or consultation with MarketMindAI?",
      answer: "Yes! For enterprise customers, tool vendors, or partnership inquiries, we offer personalized demos and consultations. Use the contact form above and select 'Partnership' or 'General Inquiry' as the type, mentioning your interest in a demo. Our team will reach out to schedule a convenient time."
    }
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Contact', href: '/contact' }
  ];

  // Enhanced structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/contact#webpage`,
        "url": `${process.env.REACT_APP_BACKEND_URL || ''}/contact`,
        "name": "Contact MarketMindAI - Get Support & Business Inquiries",
        "description": "Contact MarketMindAI for business inquiries, partnership opportunities, technical support, and general questions. We're here to help you succeed.",
        "isPartOf": {
          "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/#website`
        },
        "breadcrumb": {
          "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/contact#breadcrumb`
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/contact#breadcrumb`,
        "itemListElement": breadcrumbItems.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.label,
          "item": `${process.env.REACT_APP_BACKEND_URL || ''}${item.href}`
        }))
      },
      {
        "@type": "Organization",
        "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/#organization`,
        "name": "MarketMindAI",
        "url": process.env.REACT_APP_BACKEND_URL || '',
        "email": "support@marketmind.ai",
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "contactType": "Customer Support",
            "email": "support@marketmind.ai",
            "availableLanguage": "English"
          },
          {
            "@type": "ContactPoint",
            "contactType": "Technical Support",
            "email": "tech@marketmind.ai",
            "availableLanguage": "English"
          },
          {
            "@type": "ContactPoint",
            "contactType": "Sales",
            "email": "partnerships@marketmind.ai",
            "availableLanguage": "English"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
  };

  return (
    <>
      <EnhancedSEOHead 
        title="Contact MarketMindAI - Get Support & Business Inquiries | Customer Service"
        description="Contact MarketMindAI for business inquiries, partnership opportunities, technical support, and general questions. We're here to help you succeed with our tool discovery platform. Email support@marketmind.ai or use our contact form. Response within 24 hours."
        keywords="contact marketmindai, support, business inquiries, partnerships, customer service, help center, technical support, tool submission, contact form, email support"
        structuredData={structuredData}
        ogType="website"
        canonical={`${process.env.REACT_APP_BACKEND_URL || ''}/contact`}
      />

      <main className="min-h-screen bg-white" role="main">
        {/* Hero Section */}
        <header className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 lg:py-24" data-testid="contact-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={breadcrumbItems} className="mb-8" />
            <div className="text-center">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6" data-testid="contact-title">
                Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">MarketMindAI</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed" data-testid="contact-description">
                We&apos;re here to help you succeed. Reach out for support, partnerships, 
                or to learn more about how MarketMindAI can transform your business tool discovery process.
              </p>
            </div>
          </div>
        </header>

        <section className="py-16 lg:py-20" data-testid="contact-content">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Information */}
              <article aria-labelledby="contact-info-heading">
                <h2 id="contact-info-heading" className="text-3xl font-bold text-gray-900 mb-8" data-testid="contact-info-title">Get in Touch</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Whether you&apos;re looking for support, exploring partnership opportunities, or have questions about our platform, 
                  we&apos;d love to hear from you. Our team is dedicated to providing exceptional service and support.
                </p>

                <div className="space-y-6 mb-8" role="list" aria-label="Contact methods">
                  <div className="flex items-start space-x-4" role="listitem" data-testid="contact-email">
                    <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0" aria-hidden="true">
                      <Mail className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Email Support</h3>
                      <p className="text-gray-600 mb-2">For general inquiries and support</p>
                      <a href="mailto:support@marketmind.ai" className="text-blue-600 hover:text-blue-700 font-medium" aria-label="Email support at support@marketmind.ai">
                        support@marketmind.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4" role="listitem" data-testid="contact-partnerships">
                    <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0" aria-hidden="true">
                      <Users className="h-6 w-6 text-purple-600" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Business Partnerships</h3>
                      <p className="text-gray-600 mb-2">Partnership and integration opportunities</p>
                      <a href="mailto:partnerships@marketmind.ai" className="text-blue-600 hover:text-blue-700 font-medium" aria-label="Email partnerships at partnerships@marketmind.ai">
                        partnerships@marketmind.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4" role="listitem" data-testid="contact-technical">
                    <div className="bg-green-100 p-3 rounded-lg flex-shrink-0" aria-hidden="true">
                      <Headphones className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Technical Support</h3>
                      <p className="text-gray-600 mb-2">Platform issues and technical assistance</p>
                      <a href="mailto:tech@marketmind.ai" className="text-blue-600 hover:text-blue-700 font-medium" aria-label="Email technical support at tech@marketmind.ai">
                        tech@marketmind.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4" role="listitem" data-testid="contact-response-time">
                    <div className="bg-orange-100 p-3 rounded-lg flex-shrink-0" aria-hidden="true">
                      <Clock className="h-6 w-6 text-orange-600" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Response Time</h3>
                      <p className="text-gray-600">We typically respond within 24 hours during business days</p>
                    </div>
                  </div>
                </div>

                {/* Contact Methods */}
                <aside className="bg-gray-50 rounded-xl p-6" aria-labelledby="other-ways-heading">
                  <h3 id="other-ways-heading" className="text-xl font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
                      <span className="text-gray-600">Live chat available on our platform (for registered users)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                      <span className="text-gray-600">Join our community discussions and forums</span>
                    </div>
                  </div>
                </aside>
              </article>

              {/* Contact Form */}
              <article className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg" aria-labelledby="contact-form-heading">
                <h3 id="contact-form-heading" className="text-2xl font-bold text-gray-900 mb-6" data-testid="contact-form-title">Send us a Message</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
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
                        data-testid="contact-name-input"
                        aria-required="true"
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
                        data-testid="contact-email-input"
                        aria-required="true"
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
                      data-testid="contact-company-input"
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
                      data-testid="contact-inquiry-type-select"
                      aria-label="Select inquiry type"
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
                      data-testid="contact-subject-input"
                      aria-required="true"
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
                      data-testid="contact-message-textarea"
                      aria-required="true"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3 flex items-center justify-center"
                    data-testid="contact-submit-button"
                    aria-label="Send message"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-xs text-gray-500 mt-4">
                  * Required fields. We respect your privacy and will never share your information with third parties.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-gray-50 py-16" aria-labelledby="faq-heading" data-testid="faq-section">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <h2 id="faq-heading" className="text-3xl font-bold text-gray-900 mb-4" data-testid="faq-title">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">
                Find quick answers to common questions about contacting MarketMindAI
              </p>
            </header>
            <FAQ faqs={faqs} />
          </div>
        </section>
      </main>
    </>
  );
};

export default ContactPage;