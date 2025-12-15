import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Scale, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import EnhancedSEOHead from '../../components/SEO/EnhancedSEOHead';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FAQ from '../../components/ui/FAQ';

const TermsPage = () => {
  const lastUpdated = "January 15, 2024";
  const effectiveDate = "January 15, 2024";

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // FAQ data for AEO optimization
  const faqs = [
    {
      question: "What are MarketMindAI's Terms of Service?",
      answer: "MarketMindAI's Terms of Service constitute a legally binding agreement governing your use of our platform, website, and services. They cover account creation, user conduct, content guidelines, intellectual property rights, disclaimers, and limitation of liability. By using MarketMindAI, you agree to these terms."
    },
    {
      question: "Is MarketMindAI free to use?",
      answer: "Yes, MarketMindAI offers free basic access to browse tools, read reviews, and access basic features. We also offer premium features and advanced analytics with subscription plans. You can create a free account to access additional features like writing reviews, comparing tools, and saving favorites."
    },
    {
      question: "What are the rules for submitting reviews and content?",
      answer: "When submitting reviews and content, you must provide honest, accurate information based on actual experience with tools. Content should be respectful, avoid spam or manipulation, respect intellectual property rights, and disclose any conflicts of interest. Prohibited activities include false reviews, spam, impersonation, and uploading malicious code."
    },
    {
      question: "Who owns the content I submit to MarketMindAI?",
      answer: "You retain ownership of content you submit (reviews, comments, ratings), but you grant MarketMindAI a worldwide, royalty-free license to use, display, and distribute your content in connection with the Service. This license continues even if you stop using the Service, though you may request content removal."
    },
    {
      question: "Can MarketMindAI terminate my account?",
      answer: "Yes, MarketMindAI may suspend or terminate your access for violations of Terms of Service, illegal activities, spam, fraudulent reviews, or other reasons we deem appropriate. You can also terminate your account at any time through account settings or by contacting us. Upon termination, your right to access ceases immediately."
    },
    {
      question: "What is MarketMindAI's liability if something goes wrong?",
      answer: "MarketMindAI provides the Service 'as is' without warranties. While we strive for accuracy, we cannot guarantee completeness or reliability of user-generated content or tool information. To the maximum extent permitted by law, MarketMindAI is not liable for indirect, incidental, or consequential damages including loss of profits, data, or use."
    },
    {
      question: "How does MarketMindAI handle intellectual property?",
      answer: "MarketMindAI's platform, design, functionality, and original content are protected by intellectual property laws. Tool information, logos, and descriptions may be owned by respective companies and displayed under fair use for comparison purposes. We respect intellectual property rights and respond to valid DMCA takedown notices."
    },
    {
      question: "How will I be notified of changes to the Terms of Service?",
      answer: "We may update Terms of Service periodically. Material changes will be communicated through email notification to registered users, prominent notices on our platform, and updates to the effective date. Your continued use after changes become effective constitutes acceptance of updated Terms."
    }
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Terms of Service', href: '/terms' }
  ];

  // Enhanced structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/terms#webpage`,
        "url": `${process.env.REACT_APP_BACKEND_URL || ''}/terms`,
        "name": "Terms of Service - MarketMindAI | User Agreement & Platform Rules",
        "description": "Read MarketMindAI's Terms of Service. Understand your rights and responsibilities when using our B2B tool discovery platform.",
        "isPartOf": {
          "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/#website`
        },
        "breadcrumb": {
          "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/terms#breadcrumb`
        },
        "datePublished": "2024-01-15",
        "dateModified": lastUpdated
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/terms#breadcrumb`,
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
        title="Terms of Service - MarketMindAI | User Agreement & Platform Rules | Legal Terms"
        description="Read MarketMindAI's Terms of Service and understand your rights and responsibilities when using our B2B tool discovery platform. Covers user accounts, content guidelines, intellectual property, privacy, disclaimers, and more. Effective January 15, 2024."
        keywords="terms of service, user agreement, platform rules, legal terms, conditions of use, user responsibilities, acceptable use policy, terms and conditions, user rights"
        structuredData={structuredData}
        ogType="website"
        canonical={`${process.env.REACT_APP_BACKEND_URL || ''}/terms`}
      />

      <main className="min-h-screen bg-white" role="main">
        {/* Header */}
        <header className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 lg:py-20" data-testid="terms-hero">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={breadcrumbItems} className="mb-8" />
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full" aria-hidden="true">
                  <Scale className="h-12 w-12 text-blue-600" aria-hidden="true" />
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4" data-testid="terms-title">
                Terms of Service
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Please read these terms carefully before using MarketMindAI. They govern your use of our platform and services.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" aria-hidden="true" />
                  <time dateTime="2024-01-15">Last updated: {lastUpdated}</time>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                  <time dateTime="2024-01-15">Effective: {effectiveDate}</time>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Quick Summary */}
        <section className="py-12" aria-labelledby="summary-heading" data-testid="terms-summary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <aside className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-12">
              <h2 id="summary-heading" className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-blue-600" aria-hidden="true" />
                Key Points Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list" aria-label="Key terms points">
                <div className="space-y-4">
                  <article className="flex items-start space-x-3" role="listitem" data-testid="terms-point-free">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Free Basic Access</h3>
                      <p className="text-sm text-gray-600">Browse tools, read reviews, and access basic features at no cost</p>
                    </div>
                  </article>
                  <article className="flex items-start space-x-3" role="listitem" data-testid="terms-point-guidelines">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Community Guidelines</h3>
                      <p className="text-sm text-gray-600">Respectful, honest, and constructive participation expected</p>
                    </div>
                  </article>
                </div>
                <div className="space-y-4">
                  <article className="flex items-start space-x-3" role="listitem" data-testid="terms-point-responsibility">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Content Responsibility</h3>
                      <p className="text-sm text-gray-600">You&apos;re responsible for the accuracy and legality of your submissions</p>
                    </div>
                  </article>
                  <article className="flex items-start space-x-3" role="listitem" data-testid="terms-point-privacy">
                    <Shield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Privacy Protection</h3>
                      <p className="text-sm text-gray-600">Your data is protected according to our Privacy Policy</p>
                    </div>
                  </article>
                </div>
              </div>
            </aside>

            <article className="prose prose-lg max-w-none">
              {/* Introduction */}
              <section className="mb-12" aria-labelledby="acceptance-heading">
                <h2 id="acceptance-heading" className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 mb-4">
                  Welcome to MarketMindAI. These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you 
                  and MarketMindAI (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) regarding your use of our platform, website, and services 
                  (collectively, the &quot;Service&quot;).
                </p>
                <p className="text-gray-600">
                  By accessing or using MarketMindAI, you agree to be bound by these Terms and our Privacy Policy. 
                  If you disagree with any part of these terms, you may not access or use our Service.
                </p>
              </section>

              {/* Service Description */}
              <section className="mb-12" aria-labelledby="service-description-heading">
                <h2 id="service-description-heading" className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-600 mb-4">
                  MarketMindAI provides a platform for discovering, comparing, and reviewing business tools and software solutions. Our services include:
                </p>
                <ul className="text-gray-600 mb-6 space-y-2" role="list">
                  <li role="listitem">• Tool discovery and comparison features</li>
                  <li role="listitem">• User-generated reviews and ratings</li>
                  <li role="listitem">• AI-powered recommendations and insights</li>
                  <li role="listitem">• Blog and educational content</li>
                  <li role="listitem">• Community forums and discussions</li>
                  <li role="listitem">• Premium features for registered users</li>
                </ul>
                <p className="text-gray-600">
                  We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, 
                  with or without notice, and without liability to you.
                </p>
              </section>

              {/* User Accounts */}
              <section className="mb-12" aria-labelledby="user-accounts-heading">
                <h2 id="user-accounts-heading" className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Account Creation</h3>
                <p className="text-gray-600 mb-4">
                  To access certain features, you must create an account by providing accurate, current, and complete information. 
                  You are responsible for maintaining the confidentiality of your account credentials.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Account Security</h3>
                <ul className="text-gray-600 mb-6 space-y-2" role="list">
                  <li role="listitem">• Use a strong, unique password for your account</li>
                  <li role="listitem">• Do not share your login credentials with others</li>
                  <li role="listitem">• Notify us immediately of any unauthorized account access</li>
                  <li role="listitem">• You are responsible for all activities under your account</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Account Eligibility</h3>
                <p className="text-gray-600">
                  You must be at least 16 years old to create an account. By creating an account, you represent that you 
                  meet this age requirement and have the authority to enter into these Terms.
                </p>
              </section>

              {/* User Content and Conduct */}
              <section className="mb-12" aria-labelledby="user-content-heading">
                <h2 id="user-content-heading" className="text-2xl font-bold text-gray-900 mb-4">4. User Content and Conduct</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Content Guidelines</h3>
                <p className="text-gray-600 mb-4">When contributing content (reviews, comments, ratings), you agree to:</p>
                <ul className="text-gray-600 mb-6 space-y-2" role="list">
                  <li role="listitem">• Provide honest, accurate, and helpful information</li>
                  <li role="listitem">• Base reviews on actual experience with the tools</li>
                  <li role="listitem">• Respect intellectual property rights</li>
                  <li role="listitem">• Maintain professional and respectful communication</li>
                  <li role="listitem">• Avoid conflicts of interest or disclose them appropriately</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Prohibited Activities</h3>
                <p className="text-gray-600 mb-4">You agree not to:</p>
                <ul className="text-gray-600 mb-6 space-y-2" role="list">
                  <li role="listitem">• Submit false, misleading, or fraudulent content</li>
                  <li role="listitem">• Engage in spam, manipulation, or artificial review generation</li>
                  <li role="listitem">• Violate any laws or third-party rights</li>
                  <li role="listitem">• Attempt to gain unauthorized access to our systems</li>
                  <li role="listitem">• Use automated tools to scrape or extract data</li>
                  <li role="listitem">• Upload malicious code or engage in harmful activities</li>
                  <li role="listitem">• Impersonate others or provide false identity information</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Content Ownership and License</h3>
                <p className="text-gray-600">
                  You retain ownership of content you submit but grant MarketMindAI a worldwide, royalty-free license to use, 
                  display, and distribute your content in connection with the Service. This license continues even if you 
                  stop using the Service, though you may request content removal.
                </p>
              </section>

              {/* Intellectual Property */}
              <section className="mb-12" aria-labelledby="intellectual-property-heading">
                <h2 id="intellectual-property-heading" className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property Rights</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Our Intellectual Property</h3>
                <p className="text-gray-600 mb-4">
                  The Service, including its design, functionality, algorithms, and original content, is owned by MarketMindAI 
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
                  If you believe your content has been used without permission, contact us at <a href="mailto:legal@marketmind.ai" className="text-blue-600 hover:text-blue-700">legal@marketmind.ai</a>.
                </p>
              </section>

              {/* Privacy and Data Protection */}
              <section className="mb-12" aria-labelledby="privacy-heading">
                <h2 id="privacy-heading" className="text-2xl font-bold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
                <p className="text-gray-600 mb-4">
                  Your privacy is important to us. Our collection and use of personal information is governed by our <Link to="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>, 
                  which is incorporated into these Terms by reference.
                </p>
                <p className="text-gray-600">
                  By using the Service, you consent to the collection and use of your information as described in our Privacy Policy. 
                  We implement appropriate security measures to protect your personal data.
                </p>
              </section>

              {/* Disclaimers and Limitations */}
              <section className="mb-12" aria-labelledby="disclaimers-heading">
                <h2 id="disclaimers-heading" className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimers and Limitations of Liability</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Service Availability</h3>
                <p className="text-gray-600 mb-4">
                  We strive to maintain Service availability but cannot guarantee uninterrupted access. 
                  The Service is provided &quot;as is&quot; without warranties of any kind, express or implied.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Content Accuracy</h3>
                <p className="text-gray-600 mb-4">
                  While we make efforts to ensure accuracy, we cannot guarantee the completeness or reliability of user-generated 
                  content, tool information, or third-party data. Users should verify information independently.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.3 Limitation of Liability</h3>
                <p className="text-gray-600">
                  To the maximum extent permitted by law, MarketMindAI shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, 
                  incurred by you or any third party.
                </p>
              </section>

              {/* Indemnification */}
              <section className="mb-12" aria-labelledby="indemnification-heading">
                <h2 id="indemnification-heading" className="text-2xl font-bold text-gray-900 mb-4">8. Indemnification</h2>
                <p className="text-gray-600">
                  You agree to indemnify, defend, and hold harmless MarketMindAI and its officers, directors, employees, 
                  and agents from any claims, damages, or expenses arising from your use of the Service, your violation of 
                  these Terms, or your infringement of any third-party rights.
                </p>
              </section>

              {/* Termination */}
              <section className="mb-12" aria-labelledby="termination-heading">
                <h2 id="termination-heading" className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
                
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
              <section className="mb-12" aria-labelledby="governing-law-heading">
                <h2 id="governing-law-heading" className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law and Dispute Resolution</h2>
                <p className="text-gray-600 mb-4">
                  These Terms are governed by and construed in accordance with applicable laws. Any disputes arising from 
                  these Terms or your use of the Service will be resolved through binding arbitration, except where 
                  prohibited by law.
                </p>
                <p className="text-gray-600">
                  Before initiating any formal dispute resolution, we encourage you to contact us at <a href="mailto:support@marketmind.ai" className="text-blue-600 hover:text-blue-700">support@marketmind.ai</a> 
                  to resolve issues amicably.
                </p>
              </section>

              {/* Changes to Terms */}
              <section className="mb-12" aria-labelledby="changes-heading">
                <h2 id="changes-heading" className="text-2xl font-bold text-gray-900 mb-4">11. Changes to These Terms</h2>
                <p className="text-gray-600 mb-4">
                  We may update these Terms periodically to reflect changes in our Service or legal requirements. 
                  We will notify you of material changes through:
                </p>
                <ul className="text-gray-600 mb-6 space-y-2" role="list">
                  <li role="listitem">• Email notification to registered users</li>
                  <li role="listitem">• Prominent notice on our platform</li>
                  <li role="listitem">• Updates to the effective date at the top of this document</li>
                </ul>
                <p className="text-gray-600">
                  Your continued use of the Service after changes become effective constitutes acceptance of the updated Terms.
                </p>
              </section>

              {/* Miscellaneous */}
              <section className="mb-12" aria-labelledby="miscellaneous-heading">
                <h2 id="miscellaneous-heading" className="text-2xl font-bold text-gray-900 mb-4">12. Miscellaneous Provisions</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">12.1 Entire Agreement</h3>
                <p className="text-gray-600 mb-4">
                  These Terms, together with our <Link to="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>, constitute the entire agreement between you and MarketMindAI 
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
              <section className="mb-12" aria-labelledby="contact-heading">
                <h2 id="contact-heading" className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
                <p className="text-gray-600 mb-4">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <aside className="bg-gray-50 rounded-lg p-6" aria-label="Contact information">
                  <ul className="text-gray-600 space-y-2" role="list">
                    <li role="listitem">• <strong>General Support:</strong> <a href="mailto:support@marketmind.ai" className="text-blue-600 hover:text-blue-700">support@marketmind.ai</a></li>
                    <li role="listitem">• <strong>Legal Inquiries:</strong> <a href="mailto:legal@marketmind.ai" className="text-blue-600 hover:text-blue-700">legal@marketmind.ai</a></li>
                    <li role="listitem">• <strong>Website:</strong> <Link to="/contact" className="text-blue-600 hover:text-blue-700">Contact form at /contact</Link></li>
                    <li role="listitem">• <strong>Address:</strong> MarketMindAI Legal Department</li>
                  </ul>
                </aside>
                <p className="text-gray-600 mt-4 text-sm">
                  Thank you for using MarketMindAI. We appreciate your compliance with these Terms and your contribution 
                  to our community of business professionals.
                </p>
              </section>
            </article>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-gray-50 py-16 lg:py-20" aria-labelledby="faq-heading" data-testid="faq-section">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <h2 id="faq-heading" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="faq-title">
                Terms of Service FAQs
              </h2>
              <p className="text-xl text-gray-600">
                Common questions about using MarketMindAI and our terms
              </p>
            </header>
            <FAQ faqs={faqs} />
          </div>
        </section>
      </main>
    </>
  );
};

export default TermsPage;