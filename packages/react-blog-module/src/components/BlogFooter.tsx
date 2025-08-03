import React from 'react';
import { useBlog } from '../context/BlogContext';

interface BlogFooterProps {
  customContent?: React.ReactNode;
}

export const BlogFooter: React.FC<BlogFooterProps> = ({ customContent }) => {
  const { config } = useBlog();

  const handleBackToHome = () => {
    if (config.onNavigateBack) {
      config.onNavigateBack();
    } else {
      window.history.back();
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {customContent ? (
          customContent
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500">
              © {new Date().getFullYear()} {config.title}. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button 
                onClick={handleBackToHome} 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};