import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Lock, Eye, Users, FileText, Clock } from 'lucide-react';

const PrivacyPage = () => {
  const lastUpdated = "January 15, 2024";

  return (
    <>
      <Helmet>
        <title>Privacy Policy - MarketMind AI | Data Protection & User Privacy</title>
        <meta name="description" content="Learn how MarketMind AI protects your privacy and handles your personal data. Comprehensive privacy policy covering data collection, usage, and your rights." />
        <meta name="keywords" content="privacy policy, data protection, user privacy, GDPR, CCPA, data security, personal information" />
        <meta property="og:title" content="Privacy Policy - MarketMind AI" />
        <meta property="og:description" content="Transparent privacy policy explaining how we protect and handle your personal data at MarketMind AI." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${process.env.REACT_APP_BACKEND_URL}/privacy`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Shield className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Privacy Policy
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
              </p>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                Last updated: {lastUpdated}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Key Points */}
            <div className="bg-gray-50 rounded-xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Eye className="h-6 w-6 mr-3 text-blue-600" />
                Privacy at a Glance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-4">
                  <Lock className="h-8 w-8 text-green-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Secure Data Handling</h3>
                  <p className="text-sm text-gray-600">Your data is encrypted and securely stored using industry-standard protocols.</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <Users className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">No Unauthorized Sharing</h3>
                  <p className="text-sm text-gray-600">We never sell or share your personal data with third parties without consent.</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <FileText className="h-8 w-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Transparent Practices</h3>
                  <p className="text-sm text-gray-600">Clear information about what data we collect and how we use it.</p>
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              {/* Introduction */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-600 mb-4">
                  MarketMind AI ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy explains how we collect, use, share, and protect your information when you use our platform, website, and services.
                </p>
                <p className="text-gray-600">
                  By using MarketMind AI, you consent to the practices described in this policy. If you do not agree with this policy, 
                  please do not use our services.
                </p>
              </section>

              {/* Information We Collect */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Information You Provide</h3>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Account registration information (name, email address, company details)</li>
                  <li>• Profile information and preferences</li>
                  <li>• Reviews, comments, and ratings you submit</li>
                  <li>• Communications with our support team</li>
                  <li>• Survey responses and feedback</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Information Collected Automatically</h3>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Usage data and analytics (pages viewed, features used, time spent)</li>
                  <li>• Device information (IP address, browser type, operating system)</li>
                  <li>• Cookies and similar tracking technologies</li>
                  <li>• Log files and technical data</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Information from Third Parties</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Social media login information (if you choose to connect accounts)</li>
                  <li>• Publicly available business information for tool verification</li>
                  <li>• Analytics and marketing partners (anonymized data only)</li>
                </ul>
              </section>

              {/* How We Use Information */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-600 mb-4">We use your information to:</p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Provide and improve our platform services</li>
                  <li>• Personalize your experience and recommendations</li>
                  <li>• Process and display your reviews and content</li>
                  <li>• Communicate with you about updates, features, and support</li>
                  <li>• Ensure platform security and prevent fraud</li>
                  <li>• Analyze usage patterns to enhance user experience</li>
                  <li>• Comply with legal obligations and enforce our terms</li>
                  <li>• Send marketing communications (with your consent)</li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Share Your Information</h2>
                <p className="text-gray-600 mb-4">
                  We do not sell, rent, or trade your personal information to third parties. We may share your information in the following circumstances:
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Public Content</h3>
                <p className="text-gray-600 mb-4">
                  Reviews, ratings, and comments you submit are publicly visible along with your username and profile information.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Service Providers</h3>
                <p className="text-gray-600 mb-4">
                  We work with trusted service providers who help us operate our platform (hosting, analytics, email services). 
                  These providers are contractually bound to protect your information.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Legal Requirements</h3>
                <p className="text-gray-600 mb-4">
                  We may disclose information when required by law, to protect our rights, or to ensure platform safety and security.
                </p>
              </section>

              {/* Data Security */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
                <p className="text-gray-600 mb-4">
                  We implement robust security measures to protect your information:
                </p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Encryption of data in transit and at rest</li>
                  <li>• Regular security audits and assessments</li>
                  <li>• Access controls and authentication requirements</li>
                  <li>• Secure data centers and infrastructure</li>
                  <li>• Employee training on data protection practices</li>
                </ul>
                <p className="text-gray-600">
                  While we strive to protect your information, no method of transmission or storage is 100% secure. 
                  We encourage you to use strong passwords and keep your account information confidential.
                </p>
              </section>

              {/* Your Rights */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Privacy Rights</h2>
                <p className="text-gray-600 mb-4">You have the right to:</p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Access and review your personal information</li>
                  <li>• Correct inaccurate or incomplete data</li>
                  <li>• Delete your account and associated data</li>
                  <li>• Opt out of marketing communications</li>
                  <li>• Request data portability (where applicable)</li>
                  <li>• Object to certain data processing activities</li>
                </ul>
                <p className="text-gray-600">
                  To exercise these rights, contact us at privacy@marketmind.ai or through your account settings.
                </p>
              </section>

              {/* Cookies and Tracking */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
                <p className="text-gray-600 mb-4">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• <strong>Essential Cookies:</strong> Required for platform functionality and security</li>
                  <li>• <strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                  <li>• <strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li>• <strong>Marketing Cookies:</strong> Used for targeted advertising (with consent)</li>
                </ul>
                <p className="text-gray-600">
                  You can control cookie preferences through your browser settings or our cookie consent tool.
                </p>
              </section>

              {/* Data Retention */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
                <p className="text-gray-600 mb-4">
                  We retain your information for as long as necessary to provide services and fulfill the purposes outlined in this policy:
                </p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Account information: Until you delete your account</li>
                  <li>• Reviews and public content: May be retained to maintain platform integrity</li>
                  <li>• Analytics data: Typically retained for 2-3 years</li>
                  <li>• Support communications: Retained for customer service purposes</li>
                </ul>
              </section>

              {/* International Transfers */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
                <p className="text-gray-600">
                  MarketMind AI operates globally, and your information may be transferred to and processed in countries 
                  other than your residence. We ensure appropriate safeguards are in place to protect your information 
                  according to applicable privacy laws and international standards.
                </p>
              </section>

              {/* Children's Privacy */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
                <p className="text-gray-600">
                  MarketMind AI is not intended for use by individuals under the age of 16. We do not knowingly collect 
                  personal information from children under 16. If we become aware that we have collected such information, 
                  we will take steps to delete it promptly.
                </p>
              </section>

              {/* Policy Changes */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
                <p className="text-gray-600 mb-4">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
                  We will notify you of material changes through:
                </p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Email notification to registered users</li>
                  <li>• Prominent notice on our platform</li>
                  <li>• Updates to the "Last updated" date at the top of this policy</li>
                </ul>
                <p className="text-gray-600">
                  Your continued use of MarketMind AI after changes become effective constitutes acceptance of the updated policy.
                </p>
              </section>

              {/* Contact Information */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <ul className="text-gray-600 space-y-2">
                    <li>• Email: privacy@marketmind.ai</li>
                    <li>• Support: support@marketmind.ai</li>
                    <li>• Website: Contact form at /contact</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPage;