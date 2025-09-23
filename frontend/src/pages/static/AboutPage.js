import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Target, Users, Zap, Award, TrendingUp } from 'lucide-react';

const AboutPage = () => {
  const features = [
    {
      icon: Target,
      title: 'Curated B2B Tool Directory',
      description: 'Comprehensive database of verified business tools for lead generation, productivity, and growth.'
    },
    {
      icon: Users,
      title: 'Community-Driven Reviews',
      description: 'Real user reviews and ratings to help businesses make informed tool selection decisions.'
    },
    {
      icon: Zap,
      title: 'AI-Powered Recommendations',
      description: 'Smart tool suggestions based on your business needs, industry, and company size.'
    },
    {
      icon: Award,
      title: 'Expert Analysis',
      description: 'In-depth tool comparisons and analysis by industry experts and successful entrepreneurs.'
    },
    {
      icon: TrendingUp,
      title: 'Lead Generation Focus',
      description: 'Specialized focus on tools that drive revenue, generate leads, and accelerate business growth.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Business Tools Listed' },
    { number: '50,000+', label: 'User Reviews' },
    { number: '500+', label: 'B2B Categories' },
    { number: '98%', label: 'Customer Satisfaction' }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MarketMindAI",
    "url": "https://marketmindai.com",
    "logo": "https://marketmindai.com/logo.png",
    "description": "Leading B2B tools directory for lead generation, productivity, and business growth. Discover, compare, and choose the best business tools with AI-powered recommendations.",
    "foundingDate": "2024",
    "industry": "Software",
    "sameAs": [
      "https://x.com/marketmindai1",
      "https://www.linkedin.com/company/market-mindai",
      "https://github.com/marketmindais"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "hello@marketmindai.com"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    }
  };

  return (
    <>
      <Helmet>
        <title>About MarketMindAI - Leading B2B Tools Directory for Business Growth</title>
        <meta 
          name="description" 
          content="MarketMindAI is the premier B2B tools directory helping businesses discover, compare, and choose the best lead generation and productivity tools. AI-powered recommendations for business growth." 
        />
        <meta 
          name="keywords" 
          content="B2B tools, business tools directory, lead generation tools, productivity software, business growth tools, SaaS tools, marketing tools, sales tools" 
        />
        <meta property="og:title" content="About MarketMindAI - Leading B2B Tools Directory" />
        <meta property="og:description" content="Discover the best B2B tools for lead generation and business growth with MarketMindAI's AI-powered directory." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://marketmindai.com/about" />
        <meta property="og:image" content="https://marketmindai.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@marketmindai1" />
        <link rel="canonical" href="https://marketmindai.com/about" />
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
                About <span className="text-blue-600">MarketMindAI</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                The definitive B2B tools directory empowering businesses to discover, 
                compare, and choose the perfect tools for lead generation, productivity, 
                and sustainable growth.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Mission: Accelerating B2B Success
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  MarketMindAI was founded with a simple yet powerful mission: to help businesses 
                  find the right tools to drive growth, generate leads, and maximize productivity. 
                  We understand that choosing the right business software can make or break a company's success.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Our AI-powered platform analyzes thousands of B2B tools, user reviews, and 
                  performance metrics to provide personalized recommendations that align with 
                  your specific business needs, industry, and growth objectives.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Expert-Curated Tools</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">AI-Powered Matching</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Real User Reviews</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Businesses Trust MarketMindAI
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our comprehensive platform combines human expertise with artificial intelligence 
                to deliver the most accurate and relevant B2B tool recommendations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Values & Commitment
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Accuracy First</h3>
                <p className="text-gray-600">
                  Every tool listing is verified and regularly updated to ensure businesses 
                  get the most current and accurate information for their decision-making.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Driven</h3>
                <p className="text-gray-600">
                  Our platform thrives on authentic user reviews and community feedback, 
                  creating a trusted ecosystem for B2B tool discovery and evaluation.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Growth Focused</h3>
                <p className="text-gray-600">
                  We prioritize tools and solutions that drive measurable business growth, 
                  lead generation, and operational efficiency for our users.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Accelerate Your Business Growth?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using MarketMindAI to discover the perfect 
              tools for lead generation, productivity, and sustainable growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/tools" 
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Explore Tools Directory
              </a>
              <a 
                href="/contact" 
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;