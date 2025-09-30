import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../utils/apiClient';

const StaticPage = () => {
  const { pageKey } = useParams();
  const location = useLocation();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract page key from URL path if not available from params
  const getPageKey = () => {
    if (pageKey) return pageKey;
    const path = location.pathname.substring(1); // Remove leading slash
    return path || 'home';
  };

  useEffect(() => {
    fetchPage();
  }, [pageKey, location.pathname]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const currentPageKey = getPageKey();
      const response = await apiClient.get(`/pages/${currentPageKey}`);
      setPage(response.data);
    } catch (error) {
      console.error('Error fetching page:', error);
      setError(error.response?.status === 404 ? 'Page not found' : 'Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">{error}</p>
          <a 
            href="/" 
            className="btn-primary"
          >
            Go Back Home
          </a>
        </div>
      </div>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{page.title} - MarketMind AI</title>
        <meta name="description" content={page.meta_description || page.title} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.meta_description || page.title} />
        <meta property="og:type" content="article" />
      </Helmet>
      
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <article className="prose prose-lg prose-blue max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: page.content }}
              className="static-page-content"
            />
          </article>
          
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              <p>
                Last updated: {new Date(page.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {pageKey === 'contact' && (
                <div className="mt-6">
                  <p className="text-gray-600">
                    Have questions? Contact us at{' '}
                    <a 
                      href="mailto:hello@marketmind.ai" 
                      className="text-blue-600 hover:text-blue-800"
                    >
                      hello@marketmind.ai
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaticPage;