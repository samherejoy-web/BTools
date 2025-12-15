import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Users, FileText, Clock } from 'lucide-react';
import EnhancedSEOHead from '../../components/SEO/EnhancedSEOHead';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FAQ from '../../components/ui/FAQ';

const PrivacyPage = () => {
  const lastUpdated = "January 15, 2024";

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // FAQ data for AEO optimization
  const faqs = [
    {
      question: "What personal information does MarketMindAI collect?",
      answer: "MarketMindAI collects information you provide during registration (name, email, company details), profile preferences, reviews and ratings you submit, communications with support, and automatically collected data like usage analytics, device information, IP address, and cookies. We also collect information from third parties like social media logins if you choose to connect accounts."
    },
    {
      question: "How does MarketMindAI use my personal data?",
      answer: "We use your information to provide and improve our platform services, personalize your experience and recommendations, process and display your reviews, communicate updates and support, ensure platform security and prevent fraud, analyze usage patterns, comply with legal obligations, and send marketing communications with your consent."
    },
    {
      question: "Does MarketMindAI sell my personal information to third parties?",
      answer: "No, we do not sell, rent, or trade your personal information to third parties. We only share information with trusted service providers who help us operate our platform (hosting, analytics, email services) under strict confidentiality agreements, when required by law, or when you publicly post reviews and comments."
    },
    {
      question: "How can I access, update, or delete my personal information?",
      answer: "You have the right to access and review your personal information, correct inaccurate data, delete your account and associated data, opt out of marketing communications, and request data portability. To exercise these rights, contact us at privacy@marketmind.ai or use your account settings. We'll process requests within 30 days."
    },
    {
      question: "How does MarketMindAI protect my data?",
      answer: "We implement robust security measures including encryption of data in transit and at rest, regular security audits and assessments, access controls and authentication requirements, secure data centers and infrastructure, and employee training on data protection practices. While no method is 100% secure, we continuously work to protect your information."
    },
    {
      question: "What cookies does MarketMindAI use and can I control them?",
      answer: "We use essential cookies (required for functionality), analytics cookies (to understand usage), preference cookies (to remember settings), and marketing cookies (for targeted advertising with consent). You can control cookie preferences through your browser settings or our cookie consent tool. Essential cookies cannot be disabled as they're necessary for platform operation."
    },
    {
      question: "Is MarketMindAI GDPR and CCPA compliant?",
      answer: "Yes, MarketMindAI complies with GDPR (General Data Protection Regulation) and CCPA (California Consumer Privacy Act) requirements. We provide users with rights to access, correct, delete, and port their data. EU and California residents have additional rights under these regulations, which we fully honor."
    },
    {
      question: "How long does MarketMindAI retain my data?",
      answer: "We retain your account information until you delete your account, reviews and public content may be retained to maintain platform integrity, analytics data is typically retained for 2-3 years, and support communications are kept for customer service purposes. You can request data deletion at any time by contacting privacy@marketmind.ai."
    }
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Privacy Policy', href: '/privacy' }
  ];

  // Enhanced structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/privacy#webpage`,
        "url": `${process.env.REACT_APP_BACKEND_URL || ''}/privacy`,
        "name": "Privacy Policy - MarketMindAI | Data Protection & User Privacy",
        "description": "Learn how MarketMindAI protects your privacy and handles your personal data. Comprehensive privacy policy covering data collection, usage, and your rights.",
        "isPartOf": {
          "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/#website`
        },
        "breadcrumb": {
          "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/privacy#breadcrumb`
        },
        "datePublished": "2024-01-15",
        "dateModified": lastUpdated
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/privacy#breadcrumb`,
        "itemListElement": breadcrumbItems.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.label,
          "item": `${process.env.REACT_APP_BACKEND_URL || ''}${item.href}`
        }))
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
        title="Privacy Policy - MarketMindAI | Data Protection & User Privacy | GDPR Compliant"
        description="Learn how MarketMindAI protects your privacy and handles your personal data. Comprehensive privacy policy covering data collection, usage, security, and your rights under GDPR and CCPA. We never sell your data. Transparent data practices."
        keywords="privacy policy, data protection, user privacy, GDPR, CCPA, data security, personal information, cookie policy, data retention, user rights, privacy compliance"
        structuredData={structuredData}
        ogType="website"
        canonical={`${process.env.REACT_APP_BACKEND_URL || ''}/privacy`}
      />

      <main className="min-h-screen bg-white" role="main">
        {/* Header */}
        <header className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 lg:py-20" data-testid="privacy-hero">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={breadcrumbItems} className="mb-8" />
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full" aria-hidden="true">
                  <Shield className="h-12 w-12 text-blue-600" aria-hidden="true" />
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4" data-testid="privacy-title">
                Privacy Policy
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
              </p>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" aria-hidden="true" />
                <time dateTime="2024-01-15">Last updated: {lastUpdated}</time>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Key Points */}
            <aside className="bg-gray-50 rounded-xl p-8 mb-12" aria-labelledby="privacy-glance-heading" data-testid="privacy-glance">
              <h2 id="privacy-glance-heading" className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Eye className="h-6 w-6 mr-3 text-blue-600" aria-hidden="true" />
                Privacy at a Glance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Key privacy points">
                <article className="bg-white rounded-lg p-4" role="listitem" data-testid="privacy-point-secure">
                  <Lock className="h-8 w-8 text-green-600 mb-3" aria-hidden="true" />
                  <h3 className="font-semibold text-gray-900 mb-2">Secure Data Handling</h3>
                  <p className="text-sm text-gray-600">Your data is encrypted and securely stored using industry-standard protocols.</p>
                </article>
                <article className="bg-white rounded-lg p-4" role="listitem" data-testid="privacy-point-sharing">
                  <Users className="h-8 w-8 text-blue-600 mb-3" aria-hidden="true" />
                  <h3 className="font-semibold text-gray-900 mb-2">No Unauthorized Sharing</h3>
                  <p className="text-sm text-gray-600">We never sell or share your personal data with third parties without consent.</p>
                </article>
                <article className="bg-white rounded-lg p-4" role="listitem" data-testid="privacy-point-transparent">
                  <FileText className="h-8 w-8 text-purple-600 mb-3" aria-hidden="true" />
                  <h3 className="font-semibold text-gray-900 mb-2">Transparent Practices</h3>
                  <p className="text-sm text-gray-600">Clear information about what data we collect and how we use it.</p>
                </article>
              </div>
            </aside>

            <article className="prose prose-lg max-w-none">
              {/* Introduction */}
              <section className="mb-12" aria-labelledby="introduction-heading">
                <h2 id="introduction-heading" className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-600 mb-4">
                  MarketMindAI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy explains how we collect, use, share, and protect your information when you use our platform, website, and services.
                </p>
                <p className="text-gray-600">
                  By using MarketMindAI, you consent to the practices described in this policy. If you do not agree with this policy, 
                  please do not use our services.
                </p>
              </section>

              {/* Information We Collect */}
              <section className="mb-12" aria-labelledby="information-collection-heading">
                <h2 id="information-collection-heading" className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Information You Provide</h3>
                <ul className="text-gray-600 mb-6 space-y-2" role="list">
                  <li role="listitem">• Account registration information (name, email address, company details)</li>
                  <li role="listitem">• Profile information and preferences</li>
                  <li role="listitem">• Reviews, comments, and ratings you submit</li>
                  <li role="listitem">• Communications with our support team</li>
                  <li role="listitem">• Survey responses and feedback</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Information Collected Automatically</h3>
                <ul className="text-gray-600 mb-6 space-y-2" role="list">
                  <li role="listitem">• Usage data and analytics (pages viewed, features used, time spent)</li>
                  <li role="listitem">• Device information (IP address, browser type, operating system)</li>
                  <li role="listitem">• Cookies and similar tracking technologies</li>
                  <li role="listitem">• Log files and technical data</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Information from Third Parties</h3>
                <ul className="text-gray-600 space-y-2" role="list">
                  <li role="listitem">• Social media login information (if you choose to connect accounts)</li>
                  <li role="listitem">• Publicly available business information for tool verification</li>
                  <li role="listitem">• Analytics and marketing partners (anonymized data only)</li>
                </ul>
              </section>

              {/* How We Use Information */}
              <section className="mb-12" aria-labelledby="information-use-heading">
                <h2 id="information-use-heading" className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-600 mb-4">We use your information to:</p>
                <ul className="text-gray-600 mb-6 space-y-2" role="list">
                  <li role="listitem">• Provide and improve our platform services</li>
                  <li role="listitem">• Personalize your experience and recommendations</li>
                  <li role="listitem">• Process and display your reviews and content</li>
                  <li role="listitem">• Communicate with you about updates, features, and support</li>
                  <li role="listitem">• Ensure platform security and prevent fraud</li>
                  <li role="listitem">• Analyze usage patterns to enhance user experience</li>
                  <li role="listitem">• Comply with legal obligations and enforce our terms</li>
                  <li role="listitem">• Send marketing communications (with your consent)</li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section className="mb-12" aria-labelledby="information-sharing-heading">
                <h2 id="information-sharing-heading" className="text-2xl font-bold text-gray-900 mb-4">4. How We Share Your Information</h2>
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
              <section className="mb-12" aria-labelledby="data-security-heading">
                <h2 id="data-security-heading" className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
                <p className="text-gray-600 mb-4">
                  We implement robust security measures to protect your information:
                </p>
                <ul className="text-gray-600 mb-6 space-y-2" role="list">
                  <li role="listitem">• Encryption of data in transit and at rest</li>
                  <li role="listitem">• Regular security audits and assessments</li>
                  <li role="listitem">• Access controls and authentication requirements</li>
                  <li role="listitem">• Secure data centers and infrastructure</li>
                  <li role="listitem">• Employee training on data protection practices</li>
                </ul>
                <p className="text-gray-600">
                  While we strive to protect your information, no method of transmission or storage is 100% secure. 
                  We encourage you to use strong passwords and keep your account information confidential.
                </p>
              </section>

              {/* Your Rights */}
              <section className="mb-12" aria-labelledby="your-rights-heading">
                <h2 id="your-rights-heading" className="text-2xl font-bold text-gray-900 mb-4">6. Your Privacy Rights</h2>
                <p className="text-gray-600 mb-4">You have the right to:</p>
                <ul className="text-gray-600 mb-6 space-y-2" role="list">
                  <li role="listitem">• Access and review your personal information</li>
                  <li role="listitem">• Correct inaccurate or incomplete data</li>
                  <li role="listitem">• Delete your account and associated data</li>
                  <li role="listitem">• Opt out of marketing communications</li>
                  <li role="listitem">• Request data portability (where applicable)</li>
                  <li role="listitem">• Object to certain data processing activities</li>
                </ul>
                <p className="text-gray-600">
                  To exercise these rights, contact us at <a href="mailto:privacy@marketmind.ai" className="text-blue-600 hover:text-blue-700">privacy@marketmind.ai</a> or through your account settings.
                </p>
              </section>

              {/* Cookies and Tracking */}
              <section className="mb-12" aria-labelledby="cookies-heading">
                <h2 id="cookies-heading" className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
                <p className="text-gray-600 mb-4">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="text-gray-600 mb-6 space-y-2" role="list">
                  <li role="listitem">• <strong>Essential Cookies:</strong> Required for platform functionality and security</li>
                  <li role="listitem">• <strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                  <li role="listitem">• <strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li role="listitem">• <strong>Marketing Cookies:</strong> Used for targeted advertising (with consent)</li>
                </ul>
                <p className="text-gray-600">
                  You can control cookie preferences through your browser settings or our cookie consent tool.
                </p>
              </section>

              {/* Data Retention */}
              <section className="mb-12" aria-labelledby="data-retention-heading">
                <h2 id="data-retention-heading" className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
                <p className="text-gray-600 mb-4">
                  We retain your information for as long as necessary to provide services and fulfill the purposes outlined in this policy:
                </p>
                <ul className="text-gray-600 mb-6 space-y-2" role="list">
                  <li role="listitem">• Account information: Until you delete your account</li>
                  <li role="listitem">• Reviews and public content: May be retained to maintain platform integrity</li>
                  <li role="listitem">• Analytics data: Typically retained for 2-3 years</li>
                  <li role="listitem">• Support communications: Retained for customer service purposes</li>
                </ul>
              </section>

              {/* International Transfers */}
              <section className="mb-12" aria-labelledby="international-transfers-heading">
                <h2 id="international-transfers-heading" className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
                <p className="text-gray-600">
                  MarketMindAI operates globally, and your information may be transferred to and processed in countries 
                  other than your residence. We ensure appropriate safeguards are in place to protect your information 
                  according to applicable privacy laws and international standards.
                </p>
              </section>

              {/* Children's Privacy */}
              <section className="mb-12" aria-labelledby="childrens-privacy-heading">
                <h2 id="childrens-privacy-heading" className="text-2xl font-bold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
                <p className="text-gray-600">
                  MarketMindAI is not intended for use by individuals under the age of 16. We do not knowingly collect 
                  personal information from children under 16. If we become aware that we have collected such information, 
                  we will take steps to delete it promptly.
                </p>
              </section>

              {/* Policy Changes */}
              <section className="mb-12" aria-labelledby="policy-changes-heading">
                <h2 id="policy-changes-heading" className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
                <p className="text-gray-600 mb-4">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
                  We will notify you of material changes through:
                </p>
                <ul className="text-gray-600 mb-6 space-y-2" role="list">
                  <li role="listitem">• Email notification to registered users</li>
                  <li role="listitem">• Prominent notice on our platform</li>
                  <li role="listitem">• Updates to the &quot;Last updated&quot; date at the top of this policy</li>
                </ul>
                <p className="text-gray-600">
                  Your continued use of MarketMindAI after changes become effective constitutes acceptance of the updated policy.
                </p>
              </section>

              {/* Contact Information */}
              <section className="mb-12" aria-labelledby="contact-heading">
                <h2 id="contact-heading" className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <aside className="bg-gray-50 rounded-lg p-6" aria-label="Contact information">
                  <ul className="text-gray-600 space-y-2" role="list">
                    <li role="listitem">• Email: <a href="mailto:privacy@marketmind.ai" className="text-blue-600 hover:text-blue-700">privacy@marketmind.ai</a></li>
                    <li role="listitem">• Support: <a href="mailto:support@marketmind.ai" className="text-blue-600 hover:text-blue-700">support@marketmind.ai</a></li>
                    <li role="listitem">• Website: <Link to="/contact" className="text-blue-600 hover:text-blue-700">Contact form at /contact</Link></li>
                  </ul>
                </aside>
              </section>
            </article>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="bg-gray-50 py-16 lg:py-20" aria-labelledby="faq-heading" data-testid="faq-section">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <h2 id="faq-heading" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="faq-title">
                Privacy Policy FAQs
              </h2>
              <p className="text-xl text-gray-600">
                Common questions about how we protect and handle your data
              </p>
            </header>
            <FAQ faqs={faqs} />
          </div>
        </section>
      </main>
    </>
  );
};

export default PrivacyPage;