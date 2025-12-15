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
import Logo from '../ui/Logo';
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
  const [freeTools, setFreeTools] = useState([]);

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

  const fetchFreeTools = async () => {
    try {
      const response = await apiClient.get('/free-tools?limit=3');
      setFreeTools(response.data || []);
    } catch (error) {
      console.error('Error fetching free tools:', error);
      // Keep empty array if fetch fails
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSocialUrls();
    fetchFreeTools();
  }, []);

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
    freeTools: [
      ...freeTools.slice(0, 3).map(tool => ({ 
        name: tool.name, 
        href: tool.link, 
        external: true 
      })),
      { name: 'See More Free Tools', href: '/freetools', external: false },
    ].filter(Boolean),
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
    { name: 'Email', href: 'mailto:hello@marketmindai.com', icon: Mail },
  ];

  return (
    <footer className="bg-white border-t border-gray-100" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <section className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company info */}
            <div className="lg:col-span-1">
              <Logo className="mb-4" showText={true} />
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Discover, compare, and choose the best tools for your business. 
                Powered by AI insights and community reviews.
              </p>
              
              {/* Social links */}
              <nav aria-label="Social media links">
                <div className="flex space-x-4">
                  {socialLinks.filter(item => item.href && item.href.trim()).map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        aria-label={`Follow us on ${item.name}`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              </nav>
            </div>

            {/* Product links */}
            <nav aria-labelledby="footer-product-heading">
              <h3 id="footer-product-heading" className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
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
            </nav>

            {/* Company links */}
            <nav aria-labelledby="footer-company-heading">
              <h3 id="footer-company-heading" className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
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
            </nav>

            {/* Free Tools links */}
            <nav aria-labelledby="footer-tools-heading">
              <h3 id="footer-tools-heading" className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Free Tools
              </h3>
              <ul className="space-y-3">
                {footerLinks.freeTools.map((item) => (
                  <li key={item.name}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200 inline-flex items-center"
                      >
                        {item.name}
                        <ExternalLink className="ml-1 h-3 w-3" aria-hidden="true" />
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
            </nav>

            {/* Community links */}
            <nav aria-labelledby="footer-community-heading">
              <h3 id="footer-community-heading" className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Community
              </h3>
              <ul className="space-y-3">
                {footerLinks.community.filter(item => item.href && item.href.trim()).map((item) => (
                  <li key={item.name}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200 inline-flex items-center"
                      >
                        {item.name}
                        <ExternalLink className="ml-1 h-3 w-3" aria-hidden="true" />
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
            </nav>
          </div>
        </section>

        {/* Newsletter signup */}
        <section className="py-8 border-t border-gray-100" aria-labelledby="footer-newsletter-heading">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1">
              <h3 id="footer-newsletter-heading" className="text-lg font-semibold text-gray-900 mb-2">
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
        </section>

        {/* Bottom footer */}
        <div className="py-6 border-t border-gray-100">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex items-center space-x-6">
              <p className="text-gray-500 text-sm">
                © {currentYear} MarketMindAI. All rights reserved.
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