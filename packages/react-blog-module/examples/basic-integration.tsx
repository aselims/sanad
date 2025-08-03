import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { 
  Blog, 
  BlogConfig, 
  applyPluginPreset,
  blogThemes 
} from '@sanad/react-blog-module';

// Apply plugins
applyPluginPreset('standard');

// Blog configuration
const blogConfig: BlogConfig = {
  title: 'My Company Blog',
  basePath: '/blog',
  postsPath: '/blog',
  enableSearch: true,
  enableTags: true,
  enableShare: true,
  theme: blogThemes.modern,
  onNavigateBack: () => {
    // Custom navigation logic
    window.location.href = '/';
  }
};

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link to="/" className="text-xl font-bold text-gray-900">
                  My Company
                </Link>
                <Link to="/blog" className="text-gray-700 hover:text-gray-900">
                  Blog
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<Blog config={blogConfig} />} />
          <Route path="/blog/:slug" element={<Blog config={blogConfig} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// Home Page Component
function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Welcome to My Company
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          We build amazing products and share our insights on our blog.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Visit Our Blog
        </Link>
      </div>
    </div>
  );
}

export default App;