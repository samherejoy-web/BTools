import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import HomePage from './pages/public/HomePage';
import ToolsPage from './pages/public/ToolsPage';
import ToolDetailPage from './pages/public/ToolDetailPage';
import BlogsPage from './pages/public/BlogsPage';
import BlogDetailPage from './pages/public/BlogDetailPage';
import CompareToolsPage from './pages/public/CompareToolsPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User Dashboard
import UserDashboard from './pages/user/UserDashboard';
import UserBlogs from './pages/user/UserBlogs';
import BlogEditor from './pages/user/BlogEditor';
import UserReviews from './pages/user/UserReviews';
import UserFavorites from './pages/user/UserFavorites';
import AIBlogGenerator from './pages/user/AIBlogGenerator';

// Admin Dashboard
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSEO from './pages/admin/AdminSEO';

// Super Admin Dashboard
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminUsers from './pages/superadmin/SuperAdminUsers';
import SuperAdminTools from './pages/superadmin/SuperAdminTools';
import SuperAdminCategories from './pages/superadmin/SuperAdminCategories';
import SuperAdminBlogs from './pages/superadmin/SuperAdminBlogs';
import SuperAdminSEO from './pages/superadmin/SuperAdminSEO';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Layout wrapper for pages that need navbar/footer
const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

// Dashboard layout for admin/user areas
const DashboardLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50">
    <Navbar />
    <main className="py-8">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <Layout>
                <HomePage />
              </Layout>
            } />
            
            <Route path="/tools" element={
              <Layout>
                <ToolsPage />
              </Layout>
            } />
            
            <Route path="/tools/:toolSlug" element={
              <Layout>
                <ToolDetailPage />
              </Layout>
            } />
            
            <Route path="/blogs" element={
              <Layout>
                <BlogsPage />
              </Layout>
            } />
            
            <Route path="/blogs/:blogSlug" element={
              <Layout>
                <BlogDetailPage />
              </Layout>
            } />
            
            <Route path="/compare" element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
                <Layout>
                  <CompareToolsPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* User Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
                <DashboardLayout>
                  <UserDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/blogs" element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
                <DashboardLayout>
                  <UserBlogs />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/blogs/new" element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
                <DashboardLayout>
                  <BlogEditor />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/blogs/edit/:blogId" element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
                <DashboardLayout>
                  <BlogEditor />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/reviews" element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
                <DashboardLayout>
                  <UserReviews />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/favorites" element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
                <DashboardLayout>
                  <UserFavorites />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/ai-blog" element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
                <DashboardLayout>
                  <AIBlogGenerator />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/blogs" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <DashboardLayout>
                  <AdminBlogs />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/reviews" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <DashboardLayout>
                  <AdminReviews />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/seo" element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <DashboardLayout>
                  <AdminSEO />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Super Admin Routes */}
            <Route path="/superadmin" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <DashboardLayout>
                  <SuperAdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/superadmin/users" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <DashboardLayout>
                  <SuperAdminUsers />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/superadmin/tools" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <DashboardLayout>
                  <SuperAdminTools />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/superadmin/categories" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <DashboardLayout>
                  <SuperAdminCategories />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/superadmin/blogs" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <DashboardLayout>
                  <SuperAdminBlogs />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/superadmin/seo" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <DashboardLayout>
                  <SuperAdminSEO />
                </DashboardLayout>
              </ProtectedRoute>
            } />
          </Routes>
          
          <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;