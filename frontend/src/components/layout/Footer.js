import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Twitter, 
  Github, 
  Linkedin,
  ExternalLink,
  MessageSquare,
  Facebook
} from 'lucide-react';
import NewsletterForm from '../Newsletter/NewsletterForm';
import apiClient from '../../utils/apiClient';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [socialUrls, setSocialUrls] = useState({
    social_twitter_url: 'https://twitter.com/marketmindai',
    social_linkedin_url: 'https://linkedin.com/company/marketmind',
    social_github_url: 'https://github.com/marketmind',
    social_discord_url: 'https://discord.gg/marketmind',
    social_facebook_url: 'https://facebook.com/marketmindai'
  });

  useEffect(() => {
    fetchSocialUrls();
  }, []);

  const fetchSocialUrls = async () => {
    try {
      const response = await apiClient.get('/public/site-settings');
      setSocialUrls(prev => ({
        ...prev,
        ...response.data
      }));
    } catch (error) {
      console.error('Error fetching social URLs:', error);
      // Keep default URLs if fetch fails
    }
  };

  const footerLinks = {
    product: [
      { name: 'Browse Tools', href: '/tools' },
      { name: 'Compare Tools', href: '/compare' },
      { name: 'Blog', href: '/blogs' },
      { name: 'Categories', href: '/tools?category=all' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    resources: [
      { name: 'Help Center', href: '/help' },
      { name: 'API Documentation', href: '/api-docs' },
      { name: 'Submit a Tool', href: '/submit-tool' },
      { name: 'Partnerships', href: '/partnerships' },
    ],
    community: [
      { name: 'Discord', href: socialUrls.social_discord_url, external: true, icon: MessageSquare },
      { name: 'X (Twitter)', href: socialUrls.social_twitter_url, external: true, icon: Twitter },
      { name: 'LinkedIn', href: socialUrls.social_linkedin_url, external: true, icon: Linkedin },
      { name: 'GitHub', href: socialUrls.social_github_url, external: true, icon: Github },
      { name: 'Facebook', href: socialUrls.social_facebook_url, external: true, icon: Facebook },
    ]
  };

  const socialLinks = [
    { name: 'X (Twitter)', href: socialUrls.social_twitter_url, icon: Twitter },
    { name: 'LinkedIn', href: socialUrls.social_linkedin_url, icon: Linkedin },
    { name: 'GitHub', href: socialUrls.social_github_url, icon: Github },
    { name: 'Discord', href: socialUrls.social_discord_url, icon: MessageSquare },
    { name: 'Facebook', href: socialUrls.social_facebook_url, icon: Facebook },
    { name: 'Email', href: 'mailto:hello@marketmind.ai', icon: Mail },
  ];

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company info */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MM</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">MarketMind</span>
              </Link>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Discover, compare, and choose the best tools for your business. 
                Powered by AI insights and community reviews.
              </p>
              
              {/* Social links */}
              <div className="flex space-x-4">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <span className="sr-only">{item.name}</span>
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Product links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                {footerLinks.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Resources
              </h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Community
              </h3>
              <ul className="space-y-3">
                {footerLinks.community.map((item) => (
                  <li key={item.name}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200 inline-flex items-center"
                      >
                        {item.name}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    ) : (
                      <Link
                        to={item.href}
                        className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="py-8 border-t border-gray-100">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Stay updated with the latest tools
              </h3>
              <p className="text-gray-600 text-sm">
                Get weekly insights about new tools, comparisons, and industry trends.
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6">
              <NewsletterForm 
                source="footer"
                placeholder="Enter your email"
                buttonText="Subscribe"
                buttonClassName="btn-primary"
              />
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="py-6 border-t border-gray-100">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex items-center space-x-6">
              <p className="text-gray-500 text-sm">
                © {currentYear} MarketMind AI. All rights reserved.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-500 text-sm">
                Empowering businesses with AI-driven insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;