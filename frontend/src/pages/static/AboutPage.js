import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Users, Target, Award, Lightbulb, TrendingUp, Zap } from 'lucide-react';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About MarketMind AI - Leading B2B Tool Discovery Platform</title>
        <meta name="description" content="Learn about MarketMind AI, the premier platform for discovering, comparing, and choosing the best business tools. AI-powered insights, community reviews, and expert analysis." />
        <meta name="keywords" content="about marketmind, b2b tools, business software, tool discovery, ai insights, productivity tools, software reviews" />
        <meta property="og:title" content="About MarketMind AI - Leading B2B Tool Discovery Platform" />
        <meta property="og:description" content="Discover how MarketMind AI is revolutionizing business tool discovery with AI-powered insights and community-driven reviews." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${process.env.REACT_APP_BACKEND_URL}/about`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">MarketMind AI</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                We're revolutionizing how businesses discover, evaluate, and choose the right tools 
                for their operations through AI-powered insights and community-driven intelligence.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  At MarketMind AI, we believe that choosing the right business tools shouldn't be overwhelming or time-consuming. 
                  Our mission is to simplify the tool discovery process by providing comprehensive, AI-enhanced comparisons and 
                  authentic user reviews in one centralized platform.
                </p>
                <p className="text-lg text-gray-600">
                  We empower businesses of all sizes to make informed decisions, optimize their operations, 
                  and accelerate growth through better tool selection and strategic insights.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Target className="h-8 w-8 text-blue-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Targeted Solutions</h3>
                      <p className="text-gray-600">Personalized tool recommendations based on your specific business needs and industry requirements.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Lightbulb className="h-8 w-8 text-purple-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
                      <p className="text-gray-600">Leverage artificial intelligence to analyze tool features, pricing, and user sentiment for smarter decisions.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <TrendingUp className="h-8 w-8 text-green-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Growth Focus</h3>
                      <p className="text-gray-600">Help businesses scale efficiently by choosing tools that grow with their operations and objectives.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-gray-50 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                These principles guide everything we do and shape how we serve our community of business professionals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Excellence</h3>
                <p className="text-gray-600">
                  We maintain the highest standards in our platform, ensuring accurate data, reliable reviews, 
                  and exceptional user experiences that professionals can trust.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Community</h3>
                <p className="text-gray-600">
                  We believe in the power of collective intelligence. Our platform thrives on authentic user reviews, 
                  shared experiences, and collaborative insights from real business users.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Innovation</h3>
                <p className="text-gray-600">
                  We continuously evolve our AI algorithms and platform features to stay ahead of market trends 
                  and provide cutting-edge solutions for modern businesses.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            </div>
            
            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="text-xl leading-relaxed mb-8">
                MarketMind AI was born from a simple observation: businesses were spending countless hours researching 
                and comparing tools, often making decisions based on incomplete information or outdated reviews.
              </p>
              
              <p className="mb-6">
                Our founding team, comprised of seasoned entrepreneurs and technology experts, experienced this challenge 
                firsthand while scaling their own companies. They realized that despite the abundance of business tools 
                available, there was no centralized, intelligent platform that could provide comprehensive, 
                AI-enhanced insights to guide decision-making.
              </p>
              
              <p className="mb-6">
                Today, MarketMind AI serves thousands of businesses worldwide, from innovative startups to established 
                enterprises. Our platform has become the go-to resource for professionals seeking data-driven insights 
                about business tools, helping them make smarter decisions that drive growth and efficiency.
              </p>
              
              <p>
                We're just getting started. As we continue to expand our database, refine our AI algorithms, and grow our 
                community, we remain committed to our original vision: making business tool discovery simple, 
                intelligent, and accessible for everyone.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Discover Your Perfect Business Tools?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust MarketMind AI to guide their tool selection decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/tools"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Explore Tools
              </a>
              <a
                href="/register"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Create Account
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;