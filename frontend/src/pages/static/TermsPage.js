import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Scale, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';

const TermsPage = () => {
  const lastUpdated = "January 15, 2024";
  const effectiveDate = "January 15, 2024";

  return (
    <>
      <Helmet>
        <title>Terms of Service - MarketMind AI | User Agreement & Platform Rules</title>
        <meta name="description" content="Read MarketMind AI's Terms of Service. Understand your rights and responsibilities when using our B2B tool discovery platform." />
        <meta name="keywords" content="terms of service, user agreement, platform rules, legal terms, conditions of use, user responsibilities" />
        <meta property="og:title" content="Terms of Service - MarketMind AI" />
        <meta property="og:description" content="Legal terms and conditions for using the MarketMind AI platform and services." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${process.env.REACT_APP_BACKEND_URL}/terms`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Scale className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Terms of Service
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Please read these terms carefully before using MarketMind AI. They govern your use of our platform and services.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Last updated: {lastUpdated}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Effective: {effectiveDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-blue-600" />
                Key Points Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Free Basic Access</h3>
                      <p className="text-sm text-gray-600">Browse tools, read reviews, and access basic features at no cost</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Community Guidelines</h3>
                      <p className="text-sm text-gray-600">Respectful, honest, and constructive participation expected</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Content Responsibility</h3>
                      <p className="text-sm text-gray-600">You're responsible for the accuracy and legality of your submissions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Privacy Protection</h3>
                      <p className="text-sm text-gray-600">Your data is protected according to our Privacy Policy</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              {/* Introduction */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 mb-4">
                  Welcome to MarketMind AI. These Terms of Service ("Terms") constitute a legally binding agreement between you 
                  and MarketMind AI ("Company," "we," "our," or "us") regarding your use of our platform, website, and services 
                  (collectively, the "Service").
                </p>
                <p className="text-gray-600">
                  By accessing or using MarketMind AI, you agree to be bound by these Terms and our Privacy Policy. 
                  If you disagree with any part of these terms, you may not access or use our Service.
                </p>
              </section>

              {/* Service Description */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-600 mb-4">
                  MarketMind AI provides a platform for discovering, comparing, and reviewing business tools and software solutions. Our services include:
                </p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Tool discovery and comparison features</li>
                  <li>• User-generated reviews and ratings</li>
                  <li>• AI-powered recommendations and insights</li>
                  <li>• Blog and educational content</li>
                  <li>• Community forums and discussions</li>
                  <li>• Premium features for registered users</li>
                </ul>
                <p className="text-gray-600">
                  We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, 
                  with or without notice, and without liability to you.
                </p>
              </section>

              {/* User Accounts */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Account Creation</h3>
                <p className="text-gray-600 mb-4">
                  To access certain features, you must create an account by providing accurate, current, and complete information. 
                  You are responsible for maintaining the confidentiality of your account credentials.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Account Security</h3>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Use a strong, unique password for your account</li>
                  <li>• Do not share your login credentials with others</li>
                  <li>• Notify us immediately of any unauthorized account access</li>
                  <li>• You are responsible for all activities under your account</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Account Eligibility</h3>
                <p className="text-gray-600">
                  You must be at least 16 years old to create an account. By creating an account, you represent that you 
                  meet this age requirement and have the authority to enter into these Terms.
                </p>
              </section>

              {/* User Content and Conduct */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Content and Conduct</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Content Guidelines</h3>
                <p className="text-gray-600 mb-4">When contributing content (reviews, comments, ratings), you agree to:</p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Provide honest, accurate, and helpful information</li>
                  <li>• Base reviews on actual experience with the tools</li>
                  <li>• Respect intellectual property rights</li>
                  <li>• Maintain professional and respectful communication</li>
                  <li>• Avoid conflicts of interest or disclose them appropriately</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Prohibited Activities</h3>
                <p className="text-gray-600 mb-4">You agree not to:</p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Submit false, misleading, or fraudulent content</li>
                  <li>• Engage in spam, manipulation, or artificial review generation</li>
                  <li>• Violate any laws or third-party rights</li>
                  <li>• Attempt to gain unauthorized access to our systems</li>
                  <li>• Use automated tools to scrape or extract data</li>
                  <li>• Upload malicious code or engage in harmful activities</li>
                  <li>• Impersonate others or provide false identity information</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Content Ownership and License</h3>
                <p className="text-gray-600">
                  You retain ownership of content you submit but grant MarketMind AI a worldwide, royalty-free license to use, 
                  display, and distribute your content in connection with the Service. This license continues even if you 
                  stop using the Service, though you may request content removal.
                </p>
              </section>

              {/* Intellectual Property */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property Rights</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Our Intellectual Property</h3>
                <p className="text-gray-600 mb-4">
                  The Service, including its design, functionality, algorithms, and original content, is owned by MarketMind AI 
                  and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works 
                  without our explicit permission.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Third-Party Content</h3>
                <p className="text-gray-600 mb-4">
                  Tool information, logos, and descriptions may be owned by respective companies. We display this information 
                  under fair use provisions for comparison and review purposes.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 DMCA Compliance</h3>
                <p className="text-gray-600">
                  We respect intellectual property rights and respond to valid DMCA takedown notices. 
                  If you believe your content has been used without permission, contact us at legal@marketmind.ai.
                </p>
              </section>

              {/* Privacy and Data Protection */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
                <p className="text-gray-600 mb-4">
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, 
                  which is incorporated into these Terms by reference.
                </p>
                <p className="text-gray-600">
                  By using the Service, you consent to the collection and use of your information as described in our Privacy Policy. 
                  We implement appropriate security measures to protect your personal data.
                </p>
              </section>

              {/* Disclaimers and Limitations */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimers and Limitations of Liability</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Service Availability</h3>
                <p className="text-gray-600 mb-4">
                  We strive to maintain Service availability but cannot guarantee uninterrupted access. 
                  The Service is provided "as is" without warranties of any kind, express or implied.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Content Accuracy</h3>
                <p className="text-gray-600 mb-4">
                  While we make efforts to ensure accuracy, we cannot guarantee the completeness or reliability of user-generated 
                  content, tool information, or third-party data. Users should verify information independently.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.3 Limitation of Liability</h3>
                <p className="text-gray-600">
                  To the maximum extent permitted by law, MarketMind AI shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, 
                  incurred by you or any third party.
                </p>
              </section>

              {/* Indemnification */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Indemnification</h2>
                <p className="text-gray-600">
                  You agree to indemnify, defend, and hold harmless MarketMind AI and its officers, directors, employees, 
                  and agents from any claims, damages, or expenses arising from your use of the Service, your violation of 
                  these Terms, or your infringement of any third-party rights.
                </p>
              </section>

              {/* Termination */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9.1 Termination by You</h3>
                <p className="text-gray-600 mb-4">
                  You may terminate your account at any time by contacting us or using account deletion features in your settings.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">9.2 Termination by Us</h3>
                <p className="text-gray-600 mb-4">
                  We may suspend or terminate your access to the Service at any time for violations of these Terms, 
                  illegal activities, or other reasons we deem appropriate.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">9.3 Effect of Termination</h3>
                <p className="text-gray-600">
                  Upon termination, your right to access the Service ceases immediately. We may retain certain information 
                  as required by law or for legitimate business purposes.
                </p>
              </section>

              {/* Governing Law */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law and Dispute Resolution</h2>
                <p className="text-gray-600 mb-4">
                  These Terms are governed by and construed in accordance with applicable laws. Any disputes arising from 
                  these Terms or your use of the Service will be resolved through binding arbitration, except where 
                  prohibited by law.
                </p>
                <p className="text-gray-600">
                  Before initiating any formal dispute resolution, we encourage you to contact us at support@marketmind.ai 
                  to resolve issues amicably.
                </p>
              </section>

              {/* Changes to Terms */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to These Terms</h2>
                <p className="text-gray-600 mb-4">
                  We may update these Terms periodically to reflect changes in our Service or legal requirements. 
                  We will notify you of material changes through:
                </p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Email notification to registered users</li>
                  <li>• Prominent notice on our platform</li>
                  <li>• Updates to the effective date at the top of this document</li>
                </ul>
                <p className="text-gray-600">
                  Your continued use of the Service after changes become effective constitutes acceptance of the updated Terms.
                </p>
              </section>

              {/* Miscellaneous */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Miscellaneous Provisions</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">12.1 Entire Agreement</h3>
                <p className="text-gray-600 mb-4">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and MarketMind AI 
                  regarding the Service.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">12.2 Severability</h3>
                <p className="text-gray-600 mb-4">
                  If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full effect.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">12.3 No Waiver</h3>
                <p className="text-gray-600">
                  Our failure to enforce any provision of these Terms does not constitute a waiver of that provision or any other provision.
                </p>
              </section>

              {/* Contact Information */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
                <p className="text-gray-600 mb-4">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <ul className="text-gray-600 space-y-2">
                    <li>• <strong>General Support:</strong> support@marketmind.ai</li>
                    <li>• <strong>Legal Inquiries:</strong> legal@marketmind.ai</li>
                    <li>• <strong>Website:</strong> Contact form at /contact</li>
                    <li>• <strong>Address:</strong> MarketMind AI Legal Department</li>
                  </ul>
                </div>
                <p className="text-gray-600 mt-4 text-sm">
                  Thank you for using MarketMind AI. We appreciate your compliance with these Terms and your contribution 
                  to our community of business professionals.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsPage;