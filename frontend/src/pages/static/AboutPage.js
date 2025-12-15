import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Award, Lightbulb, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import EnhancedSEOHead from '../../components/SEO/EnhancedSEOHead';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FAQ from '../../components/ui/FAQ';
import { Button } from '../../components/ui/button';

const AboutPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // FAQ data for AEO optimization
  const faqs = [
    {
      question: "What is MarketMindAI's mission?",
      answer: "MarketMindAI's mission is to simplify the business tool discovery process by providing comprehensive, AI-enhanced comparisons and authentic user reviews in one centralized platform. We empower businesses of all sizes to make informed decisions, optimize their operations, and accelerate growth through better tool selection and strategic insights."
    },
    {
      question: "How long has MarketMindAI been helping businesses?",
      answer: "MarketMindAI was founded in 2024 by a team of seasoned entrepreneurs and technology experts who experienced firsthand the challenges of finding the right business tools while scaling their own companies. Since launch, we've been helping thousands of businesses worldwide make smarter software decisions."
    },
    {
      question: "What makes MarketMindAI different from other tool directories?",
      answer: "Unlike traditional tool directories, MarketMindAI combines AI-powered insights with community-driven intelligence. We provide personalized tool recommendations based on your specific business needs, industry requirements, and budget. Our platform features comprehensive comparisons, verified user reviews, and AI-enhanced analysis to help you make data-driven decisions faster."
    },
    {
      question: "Who is behind MarketMindAI?",
      answer: "MarketMindAI was founded by a team of seasoned entrepreneurs and technology experts who have deep experience in building and scaling businesses. Our founding team combines expertise in software development, business operations, AI/ML, and user experience design to create the best possible tool discovery platform."
    },
    {
      question: "What are MarketMindAI's core values?",
      answer: "Our core values are Excellence (maintaining highest standards in platform quality and user experience), Community (believing in collective intelligence and authentic user reviews), and Innovation (continuously evolving our AI algorithms and features to stay ahead of market trends). These principles guide everything we do."
    },
    {
      question: "How can I get involved with MarketMindAI?",
      answer: "You can get involved by creating a free account, writing reviews for tools you've used, participating in community discussions, submitting new tools for listing, or reaching out to our partnerships team for collaboration opportunities. We value community contributions and feedback."
    }
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' }
  ];

  // Enhanced structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/about#webpage`,
        "url": `${process.env.REACT_APP_BACKEND_URL || ''}/about`,
        "name": "About MarketMindAI - Leading B2B Tool Discovery Platform",
        "description": "Learn about MarketMindAI, the premier platform for discovering, comparing, and choosing the best business tools. AI-powered insights, community reviews, and expert analysis.",
        "isPartOf": {
          "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/#website`
        },
        "breadcrumb": {
          "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/about#breadcrumb`
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/about#breadcrumb`,
        "itemListElement": breadcrumbItems.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.label,
          "item": `${process.env.REACT_APP_BACKEND_URL || ''}${item.href}`
        }))
      },
      {
        "@type": "Organization",
        "@id": `${process.env.REACT_APP_BACKEND_URL || ''}/#organization`,
        "name": "MarketMindAI",
        "url": process.env.REACT_APP_BACKEND_URL || '',
        "logo": {
          "@type": "ImageObject",
          "url": `${process.env.REACT_APP_BACKEND_URL || ''}/logo.png`
        },
        "description": "Leading B2B software comparison and discovery platform helping businesses find the best tools and software solutions",
        "foundingDate": "2024",
        "founder": {
          "@type": "Person",
          "name": "MarketMindAI Founding Team"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Customer Service",
          "availableLanguage": "English",
          "url": `${process.env.REACT_APP_BACKEND_URL || ''}/contact`
        }
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
        title="About MarketMindAI - Leading B2B Tool Discovery Platform | Our Mission & Story"
        description="Learn about MarketMindAI, the premier platform for discovering, comparing, and choosing the best business tools. AI-powered insights, community reviews, and expert analysis helping thousands of businesses worldwide make smarter software decisions."
        keywords="about marketmind, b2b tools, business software, tool discovery, ai insights, productivity tools, software reviews, about us, company mission, our story, business tool platform"
        structuredData={structuredData}
        ogType="website"
        canonical={`${process.env.REACT_APP_BACKEND_URL || ''}/about`}
      />

      <main className="min-h-screen bg-white" role="main">
        {/* Hero Section */}
        <header className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 lg:py-24" data-testid="about-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={breadcrumbItems} className="mb-8" />
            <div className="text-center">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6" data-testid="about-title">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">MarketMindAI</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed" data-testid="about-description">
                We&apos;re revolutionizing how businesses discover, evaluate, and choose the right tools 
                for their operations through AI-powered insights and community-driven intelligence.
              </p>
            </div>
          </div>
        </header>

        {/* Mission Section */}
        <section className="py-16 lg:py-20" aria-labelledby="mission-heading" data-testid="mission-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <article>
                <h2 id="mission-heading" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6" data-testid="mission-title">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  At MarketMindAI, we believe that choosing the right business tools shouldn't be overwhelming or time-consuming. 
                  Our mission is to simplify the tool discovery process by providing comprehensive, AI-enhanced comparisons and 
                  authentic user reviews in one centralized platform.
                </p>
                <p className="text-lg text-gray-600">
                  We empower businesses of all sizes to make informed decisions, optimize their operations, 
                  and accelerate growth through better tool selection and strategic insights.
                </p>
              </article>
              <aside className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8" aria-label="Key features">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Target className="h-8 w-8 text-blue-600 mt-1 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Targeted Solutions</h3>
                      <p className="text-gray-600">Personalized tool recommendations based on your specific business needs and industry requirements.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Lightbulb className="h-8 w-8 text-purple-600 mt-1 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
                      <p className="text-gray-600">Leverage artificial intelligence to analyze tool features, pricing, and user sentiment for smarter decisions.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <TrendingUp className="h-8 w-8 text-green-600 mt-1 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Growth Focus</h3>
                      <p className="text-gray-600">Help businesses scale efficiently by choosing tools that grow with their operations and objectives.</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-gray-50 py-16 lg:py-20" aria-labelledby="values-heading" data-testid="values-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <h2 id="values-heading" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="values-title">Our Core Values</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                These principles guide everything we do and shape how we serve our community of business professionals.
              </p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list" aria-label="Core values">
              <article className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300" role="listitem" data-testid="value-excellence">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6" aria-hidden="true">
                  <Award className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Excellence</h3>
                <p className="text-gray-600">
                  We maintain the highest standards in our platform, ensuring accurate data, reliable reviews, 
                  and exceptional user experiences that professionals can trust.
                </p>
              </article>
              
              <article className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300" role="listitem" data-testid="value-community">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6" aria-hidden="true">
                  <Users className="h-6 w-6 text-purple-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Community</h3>
                <p className="text-gray-600">
                  We believe in the power of collective intelligence. Our platform thrives on authentic user reviews, 
                  shared experiences, and collaborative insights from real business users.
                </p>
              </article>
              
              <article className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300" role="listitem" data-testid="value-innovation">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-6" aria-hidden="true">
                  <Zap className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Innovation</h3>
                <p className="text-gray-600">
                  We continuously evolve our AI algorithms and platform features to stay ahead of market trends 
                  and provide cutting-edge solutions for modern businesses.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 lg:py-20" aria-labelledby="story-heading" data-testid="story-section">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <h2 id="story-heading" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6" data-testid="story-title">Our Story</h2>
            </header>
            
            <article className="prose prose-lg mx-auto text-gray-600">
              <p className="text-xl leading-relaxed mb-8">
                MarketMindAI was born from a simple observation: businesses were spending countless hours researching 
                and comparing tools, often making decisions based on incomplete information or outdated reviews.
              </p>
              
              <p className="mb-6">
                Our founding team, comprised of seasoned entrepreneurs and technology experts, experienced this challenge 
                firsthand while scaling their own companies. They realized that despite the abundance of business tools 
                available, there was no centralized, intelligent platform that could provide comprehensive, 
                AI-enhanced insights to guide decision-making.
              </p>
              
              <p className="mb-6">
                Today, MarketMindAI serves thousands of businesses worldwide, from innovative startups to established 
                enterprises. Our platform has become the go-to resource for professionals seeking data-driven insights 
                about business tools, helping them make smarter decisions that drive growth and efficiency.
              </p>
              
              <p>
                We're just getting started. As we continue to expand our database, refine our AI algorithms, and grow our 
                community, we remain committed to our original vision: making business tool discovery simple, 
                intelligent, and accessible for everyone.
              </p>
            </article>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-gray-50 py-16 lg:py-20" aria-labelledby="faq-heading" data-testid="faq-section">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <h2 id="faq-heading" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="faq-title">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Learn more about MarketMindAI, our mission, and how we help businesses
              </p>
            </header>
            <FAQ faqs={faqs} />
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16" aria-labelledby="cta-heading" data-testid="cta-section">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 id="cta-heading" className="text-3xl lg:text-4xl font-bold text-white mb-6" data-testid="cta-title">
              Ready to Discover Your Perfect Business Tools?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust MarketMindAI to guide their tool selection decisions.
            </p>
            <nav className="flex flex-col sm:flex-row gap-4 justify-center" aria-label="Call to action">
              <Link to="/tools">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
                  data-testid="explore-tools-cta-btn"
                  aria-label="Explore business tools"
                >
                  Explore Tools
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
                  data-testid="create-account-cta-btn"
                  aria-label="Create free account"
                >
                  Create Account
                </Button>
              </Link>
            </nav>
          </div>
        </section>
      </main>
    </>
  );
};

export default AboutPage;