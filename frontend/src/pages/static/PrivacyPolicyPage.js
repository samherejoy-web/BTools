import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Eye, Lock, Database, UserCheck, Globe } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: Database,
      content: [
        {
          subtitle: 'Personal Information',
          text: 'We collect information you provide directly, such as when you create an account, subscribe to newsletters, submit tool reviews, or contact us. This includes your name, email address, company information, and communication preferences.'
        },
        {
          subtitle: 'Usage Information',
          text: 'We automatically collect information about how you use MarketMindAI, including pages visited, tools viewed, search queries, and interaction patterns to improve our B2B tools recommendations.'
        },
        {
          subtitle: 'Business Information',
          text: 'For B2B partnerships and tool submissions, we may collect additional business information including company details, industry sector, and business requirements to provide relevant tool suggestions.'
        }
      ]
    },
    {
      id: 'information-use',
      title: 'How We Use Information',
      icon: UserCheck,
      content: [
        {
          subtitle: 'Service Provision',
          text: 'We use your information to provide personalized B2B tool recommendations, maintain your account, process transactions, and deliver our lead generation and productivity tool directory services.'
        },
        {
          subtitle: 'Communication',
          text: 'We communicate with you about service updates, new tool listings, industry insights, marketing communications (with your consent), and respond to your inquiries and support requests.'
        },
        {
          subtitle: 'Improvement & Analytics',
          text: 'We analyze usage patterns to improve our platform, develop new features, enhance tool categorization, and provide better matching algorithms for B2B tool discovery.'
        }
      ]
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    "name": "MarketMindAI Privacy Policy",
    "url": "https://marketmindai.com/privacy",
    "description": "Privacy Policy for MarketMindAI - B2B tools directory platform. Learn how we protect your data and privacy while providing business tool recommendations.",
    "dateModified": "2024-01-01",
    "publisher": {
      "@type": "Organization",
      "name": "MarketMindAI",
      "url": "https://marketmindai.com"
    }
  };

  return (
    <>
      <Helmet>
        <title>Privacy Policy - MarketMindAI Data Protection & Privacy Practices</title>
        <meta 
          name="description" 
          content="MarketMindAI Privacy Policy - Learn how we protect your personal information, business data, and privacy while providing B2B tool recommendations and lead generation services." 
        />
        <meta 
          name="keywords" 
          content="privacy policy, data protection, MarketMindAI privacy, B2B data security, business information privacy, GDPR compliance" 
        />
        <meta property="og:title" content="Privacy Policy - MarketMindAI Data Protection" />
        <meta property="og:description" content="Comprehensive privacy policy outlining how MarketMindAI protects your business data and personal information." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://marketmindai.com/privacy" />
        <link rel="canonical" href="https://marketmindai.com/privacy" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Privacy Policy
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                At MarketMindAI, we are committed to protecting your privacy and ensuring 
                the security of your personal and business information while providing 
                the best B2B tools directory experience.
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
                <a href="#information-collection" className="text-blue-600 hover:text-blue-700">Information We Collect</a>
                <a href="#information-use" className="text-blue-600 hover:text-blue-700">How We Use Information</a>
                <a href="#data-sharing" className="text-blue-600 hover:text-blue-700">Data Sharing</a>
                <a href="#data-security" className="text-blue-600 hover:text-blue-700">Data Security</a>
                <a href="#your-rights" className="text-blue-600 hover:text-blue-700">Your Rights</a>
                <a href="#contact" className="text-blue-600 hover:text-blue-700">Contact Us</a>
              </div>
            </div>

            {/* Overview */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Commitment to Your Privacy</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                MarketMindAI operates as a trusted B2B tools directory, helping businesses discover 
                the best lead generation, productivity, and growth tools. This Privacy Policy explains 
                how we collect, use, and protect your information when you use our platform.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center text-green-600">
                  <Lock className="h-5 w-5 mr-3" />
                  <span className="font-medium">Secure Data Handling</span>
                </div>
                <div className="flex items-center text-green-600">
                  <Eye className="h-5 w-5 mr-3" />
                  <span className="font-medium">Transparent Practices</span>
                </div>
                <div className="flex items-center text-green-600">
                  <Globe className="h-5 w-5 mr-3" />
                  <span className="font-medium">GDPR Compliant</span>
                </div>
              </div>
            </div>

            {/* Main Sections */}
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.id} id={section.id} className="mb-12">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                  
                  {section.content.map((item, index) => (
                    <div key={index} className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.subtitle}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Data Sharing */}
            <div id="data-sharing" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Information Sharing and Disclosure</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Providers</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We share information with trusted service providers who help us operate MarketMindAI, 
                    including hosting services, analytics providers, and customer support tools. These 
                    providers are contractually bound to protect your information.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Transfers</h3>
                  <p className="text-gray-600 leading-relaxed">
                    In the event of a merger, acquisition, or sale of assets, user information may be 
                    transferred as part of the transaction, subject to equivalent privacy protections.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Requirements</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We may disclose information when required by law, to protect our rights, or to 
                    ensure the safety and security of our platform and users.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div id="data-security" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Security Measures</h2>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <Lock className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-blue-900">Enterprise-Grade Security</h3>
                </div>
                <p className="text-blue-800">
                  We implement industry-standard security measures to protect your business and personal 
                  information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Safeguards</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• SSL/TLS encryption for data transmission</li>
                    <li>• Encrypted data storage</li>
                    <li>• Regular security audits and monitoring</li>
                    <li>• Access controls and authentication</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Operational Safeguards</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Limited access to personal information</li>
                    <li>• Employee privacy training</li>
                    <li>• Incident response procedures</li>
                    <li>• Regular backup and recovery testing</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div id="your-rights" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Privacy Rights</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Access and Portability</h3>
                    <p className="text-gray-600">Request access to your personal information and receive a copy in a portable format.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Correction and Updates</h3>
                    <p className="text-gray-600">Update or correct your personal and business information through your account settings.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Deletion</h3>
                    <p className="text-gray-600">Request deletion of your account and associated personal information, subject to legal requirements.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Marketing Communications</h3>
                    <p className="text-gray-600">Opt out of marketing communications while continuing to receive important service updates.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookies and Tracking Technologies</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience on MarketMindAI, 
                including remembering your preferences, analyzing site usage, and providing personalized 
                B2B tool recommendations.
              </p>
              <p className="text-gray-600 leading-relaxed">
                You can control cookie settings through your browser preferences. However, disabling 
                certain cookies may limit your ability to use some features of our platform.
              </p>
            </div>

            {/* Updates */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Policy Updates</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy to reflect changes in our practices, legal requirements, 
                or service enhancements. We will notify users of significant changes through email or 
                prominent notices on our platform.
              </p>
            </div>

            {/* Contact */}
            <div id="contact" className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us About Privacy</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                If you have questions about this Privacy Policy, your personal information, or 
                would like to exercise your privacy rights, please contact us:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Email</h3>
                  <a href="mailto:hello@marketmindai.com" className="text-blue-600 hover:text-blue-700">
                    hello@marketmindai.com
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Privacy-related inquiries</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Response Time</h3>
                  <p className="text-gray-600">We respond to privacy inquiries within 30 days</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;