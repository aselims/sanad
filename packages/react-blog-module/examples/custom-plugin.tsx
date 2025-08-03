import React from 'react';
import { 
  BlogPlugin, 
  blogPluginManager, 
  Blog, 
  BlogConfig 
} from '@sanad/react-blog-module';
import { Eye, Calendar, User } from 'lucide-react';

// Custom Analytics Plugin
const AnalyticsPlugin: BlogPlugin = {
  name: 'AnalyticsPlugin',
  version: '1.0.0',
  description: 'Tracks blog post views and displays analytics',
  
  init: (config) => {
    console.log('Analytics plugin initialized');
    // Initialize analytics tracking
  },
  
  onPostLoad: (post, content) => {
    // Track page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: post.title,
        page_location: window.location.href
      });
    }
  },
  
  transformPost: (post) => {
    // Add random view count for demo
    return {
      ...post,
      views: Math.floor(Math.random() * 1000) + 100
    };
  },
  
  renderPostHeader: (post) => {
    return (
      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{new Date(post.date).toLocaleDateString()}</span>
        </div>
        {post.author && (
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span>{post.author}</span>
          </div>
        )}
        {(post as any).views && (
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            <span>{(post as any).views} views</span>
          </div>
        )}
      </div>
    );
  }
};

// Custom Theme Plugin
const DarkModePlugin: BlogPlugin = {
  name: 'DarkModePlugin',
  version: '1.0.0',
  description: 'Adds dark mode toggle functionality',
  
  init: () => {
    // Add dark mode styles to document
    const style = document.createElement('style');
    style.textContent = `
      .dark-mode {
        --bg-color: #1a1a1a;
        --text-color: #ffffff;
        --card-bg: #2a2a2a;
      }
      .dark-mode .bg-gray-50 { background-color: var(--bg-color) !important; }
      .dark-mode .bg-white { background-color: var(--card-bg) !important; }
      .dark-mode .text-gray-900 { color: var(--text-color) !important; }
    `;
    document.head.appendChild(style);
  },
  
  renderSidebar: () => {
    const [isDark, setIsDark] = React.useState(false);
    
    const toggleDarkMode = () => {
      setIsDark(!isDark);
      document.body.classList.toggle('dark-mode');
    };
    
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="font-semibold mb-3">Theme</h3>
        <button
          onClick={toggleDarkMode}
          className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    );
  }
};

// Register custom plugins
blogPluginManager.register(AnalyticsPlugin);
blogPluginManager.register(DarkModePlugin);

// Blog configuration with custom plugins
const blogConfig: BlogConfig = {
  title: 'Blog with Custom Plugins',
  basePath: '/blog',
  postsPath: '/blog',
  enableSearch: true,
  enableTags: true,
  enableShare: true
};

// Example usage
function BlogWithCustomPlugins() {
  return (
    <div className="min-h-screen">
      <Blog config={blogConfig} />
    </div>
  );
}

export default BlogWithCustomPlugins;