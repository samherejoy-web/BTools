import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Scale, FileText, Shield, Users, AlertTriangle, CheckCircle } from 'lucide-react';

const TermsOfServicePage = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TermsOfService",
    "name": "MarketMindAI Terms of Service",
    "url": "https://marketmindai.com/terms",
    "description": "Terms of Service for MarketMindAI B2B tools directory platform. Understand your rights and responsibilities when using our business tool recommendation services.",
    "dateModified": "2024-01-01",
    "publisher": {
      "@type": "Organization",
      "name": "MarketMindAI",
      "url": "https://marketmindai.com"
    }
  };

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      content: 'By accessing and using MarketMindAI, you accept and agree to be bound by the terms and provision of this agreement. Our platform provides B2B tool recommendations, reviews, and directory services to help businesses discover the best lead generation and productivity solutions.'
    },
    {
      id: 'services',
      title: 'Description of Services',
      content: 'MarketMindAI is a comprehensive B2B tools directory that helps businesses discover, compare, and choose the right software tools for lead generation, productivity, and business growth. We provide AI-powered recommendations, user reviews, tool comparisons, and expert insights to support informed business decisions.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Terms of Service - MarketMindAI Legal Terms & Conditions</title>
        <meta 
          name="description" 
          content="MarketMindAI Terms of Service - Legal terms and conditions for using our B2B tools directory platform. Understand your rights and responsibilities for business tool recommendations." 
        />
        <meta 
          name="keywords" 
          content="terms of service, legal terms, MarketMindAI conditions, B2B platform terms, business tools directory legal, user agreement" 
        />
        <meta property="og:title" content="Terms of Service - MarketMindAI Legal Terms" />
        <meta property="og:description" content="Legal terms and conditions for using MarketMindAI B2B tools directory platform." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://marketmindai.com/terms" />
        <link rel="canonical" href="https://marketmindai.com/terms" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Scale className="h-16 w-16 text-blue-600 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Terms of Service
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                These terms govern your use of MarketMindAI and establish the 
                legal framework for our B2B tools directory platform and services.
              </p>
              <div className="mt-6 text-sm text-gray-500">
                Last updated: January 1, 2024
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Quick Navigation */}
            <div className="bg-gray-50 rounded-lg p-6 mb-12">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <a href="#acceptance" className="text-blue-600 hover:text-blue-700">Acceptance of Terms</a>
                <a href="#services" className="text-blue-600 hover:text-blue-700">Description of Services</a>
                <a href="#user-accounts" className="text-blue-600 hover:text-blue-700">User Accounts</a>
                <a href="#acceptable-use" className="text-blue-600 hover:text-blue-700">Acceptable Use</a>
                <a href="#intellectual-property" className="text-blue-600 hover:text-blue-700">Intellectual Property</a>
                <a href="#disclaimers" className="text-blue-600 hover:text-blue-700">Disclaimers</a>
                <a href="#limitation-liability" className="text-blue-600 hover:text-blue-700">Limitation of Liability</a>
                <a href="#termination" className="text-blue-600 hover:text-blue-700">Termination</a>
              </div>
            </div>

            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to MarketMindAI</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                MarketMindAI is dedicated to helping businesses discover the best B2B tools for 
                lead generation, productivity, and growth. These Terms of Service ("Terms") govern 
                your use of our platform and establish our mutual rights and responsibilities.
              </p>
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-blue-900">Agreement Highlights</h3>
                </div>
                <ul className="text-blue-800 space-y-2">
                  <li>• Professional B2B tools directory services</li>
                  <li>• AI-powered business tool recommendations</li>
                  <li>• Community-driven reviews and ratings</li>
                  <li>• Expert insights for business growth</li>
                </ul>
              </div>
            </div>

            {/* Acceptance of Terms */}
            <div id="acceptance" className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
              </div>
              
              <p className="text-gray-600 leading-relaxed mb-4">
                By accessing, browsing, or using MarketMindAI, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms of Service and our Privacy Policy. 
                If you do not agree to these terms, please do not use our services.
              </p>
              
              <p className="text-gray-600 leading-relaxed">
                These terms apply to all users of MarketMindAI, including visitors, registered users, 
                business partners, and tool providers. We reserve the right to update these terms 
                at any time, and continued use of our platform constitutes acceptance of any changes.
              </p>
            </div>

            {/* Description of Services */}
            <div id="services" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Description of Services</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">B2B Tools Directory</h3>
                  <p className="text-gray-600 leading-relaxed">
                    MarketMindAI provides a comprehensive directory of business tools, software, and 
                    services specifically focused on lead generation, productivity enhancement, and 
                    business growth solutions. Our curated database helps businesses discover and 
                    compare tools relevant to their needs.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">AI-Powered Recommendations</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our platform utilizes artificial intelligence to analyze user preferences, business 
                    requirements, and tool characteristics to provide personalized recommendations. 
                    These suggestions are based on algorithmic analysis and may not guarantee 
                    specific business outcomes.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">User-Generated Content</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Users can contribute reviews, ratings, and feedback about business tools. 
                    While we moderate this content, we do not guarantee its accuracy or completeness. 
                    User opinions are independent and do not necessarily reflect MarketMindAI's views.
                  </p>
                </div>
              </div>
            </div>

            {/* User Accounts */}
            <div id="user-accounts" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">User Accounts and Registration</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Creation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To access certain features, you may need to create an account. You must provide 
                    accurate, current, and complete information and maintain the security of your 
                    account credentials.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Responsibility</h3>
                  <p className="text-gray-600 leading-relaxed">
                    You are responsible for all activities that occur under your account. Notify us 
                    immediately of any unauthorized use or security breaches.
                  </p>
                </div>
              </div>
            </div>

            {/* Acceptable Use */}
            <div id="acceptable-use" className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Acceptable Use Policy</h2>
              </div>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                When using MarketMindAI, you agree not to engage in any of the following prohibited activities:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Prohibited Content</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• False or misleading information</li>
                    <li>• Spam or promotional content</li>
                    <li>• Offensive or inappropriate material</li>
                    <li>• Copyrighted content without permission</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Prohibited Actions</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Automated data collection (scraping)</li>
                    <li>• Reverse engineering our services</li>
                    <li>• Interfering with platform operation</li>
                    <li>• Creating multiple accounts deceptively</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Intellectual Property */}
            <div id="intellectual-property" className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Intellectual Property Rights</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">MarketMindAI Content</h3>
                  <p className="text-gray-600 leading-relaxed">
                    All content, features, and functionality on MarketMindAI, including but not limited 
                    to text, graphics, logos, software, and design, are owned by MarketMindAI and 
                    protected by intellectual property laws.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">User Content License</h3>
                  <p className="text-gray-600 leading-relaxed">
                    By submitting content (reviews, comments, feedback), you grant MarketMindAI a 
                    non-exclusive, royalty-free license to use, modify, and display your content 
                    in connection with our services.
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimers */}
            <div id="disclaimers" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Disclaimers and Warranties</h2>
              
              <div className="bg-yellow-50 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
                  <h3 className="text-lg font-semibold text-yellow-900">Important Disclaimers</h3>
                </div>
                <p className="text-yellow-800">
                  MarketMindAI provides information and recommendations on an "as-is" basis. 
                  We do not guarantee the accuracy, completeness, or reliability of tool information 
                  or business outcomes from using recommended tools.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Availability</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We strive to maintain continuous service availability but do not guarantee 
                    uninterrupted access. We may modify, suspend, or discontinue services with 
                    or without notice.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Third-Party Tools</h3>
                  <p className="text-gray-600 leading-relaxed">
                    MarketMindAI is not responsible for the performance, functionality, or support 
                    of third-party tools listed in our directory. Users engage with tool providers 
                    at their own risk.
                  </p>
                </div>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div id="limitation-liability" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Limitation of Liability</h2>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                To the maximum extent permitted by law, MarketMindAI shall not be liable for any 
                indirect, incidental, special, consequential, or punitive damages, including but 
                not limited to business losses, revenue loss, or data loss, arising from your 
                use of our services.
              </p>
              
              <p className="text-gray-600 leading-relaxed">
                Our total liability for any claims related to our services shall not exceed the 
                amount you paid to MarketMindAI in the twelve months preceding the claim, or $100, 
                whichever is greater.
              </p>
            </div>

            {/* Termination */}
            <div id="termination" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Termination</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">By You</h3>
                  <p className="text-gray-600 leading-relaxed">
                    You may terminate your account at any time by contacting us or using account 
                    deletion features. Upon termination, your access to paid features will cease.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">By MarketMindAI</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We may terminate or suspend your account immediately if you violate these 
                    terms or engage in prohibited activities, without prior notice or liability.
                  </p>
                </div>
              </div>
            </div>

            {/* Governing Law */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of 
                the United States, without regard to conflict of law principles. Any disputes 
                shall be resolved through binding arbitration or in courts of competent jurisdiction.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions About These Terms?</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                If you have questions about these Terms of Service or need clarification 
                about your rights and responsibilities, please contact us:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Email</h3>
                  <a href="mailto:hello@marketmindai.com" className="text-blue-600 hover:text-blue-700">
                    hello@marketmindai.com
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Legal and terms inquiries</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Response Time</h3>
                  <p className="text-gray-600">We respond to legal inquiries within 7 business days</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default TermsOfServicePage;