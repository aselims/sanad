import React from 'react';
import { Blog, BlogConfig, applyPluginPreset } from '@sanad/react-blog-module';

interface BlogModularProps {
  onNavigateBack: () => void;
}

// Initialize plugins
applyPluginPreset('standard');

const blogConfig: BlogConfig = {
  title: 'Saned Blog',
  basePath: '/blog',
  postsPath: '/blog',
  enableSearch: true,
  enableTags: true,
  enableShare: true,
  postsPerPage: 10,
  onNavigateBack: undefined, // Will be set in component
  theme: {
    colors: {
      primary: '#4f46e5',
      secondary: '#6b7280',
      text: '#111827',
      background: '#f9fafb',
      accent: '#10b981'
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      headingSize: '1.875rem',
      bodySize: '1rem'
    }
  }
};

export function BlogModular({ onNavigateBack }: BlogModularProps) {
  // Update config with navigation handler
  const config = {
    ...blogConfig,
    onNavigateBack
  };

  // Custom footer content
  const footerContent = (
    <div className="flex flex-col md:flex-row justify-between items-center">
      <p className="text-gray-500">© 2023 Saned. All rights reserved.</p>
      <div className="flex space-x-4 mt-4 md:mt-0">
        <button 
          onClick={onNavigateBack} 
          className="text-gray-500 hover:text-gray-700"
        >
          Back to Home
        </button>
      </div>
    </div>
  );

  return <Blog config={config} footerContent={footerContent} />;
}