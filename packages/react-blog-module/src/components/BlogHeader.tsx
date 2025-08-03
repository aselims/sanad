import React from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useBlog } from '../context/BlogContext';

interface BlogHeaderProps {
  isPostView?: boolean;
  onShare?: () => void;
}

export const BlogHeader: React.FC<BlogHeaderProps> = ({ 
  isPostView = false, 
  onShare 
}) => {
  const { config } = useBlog();

  const handleBack = () => {
    if (config.onNavigateBack) {
      config.onNavigateBack();
    } else {
      window.history.back();
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      const url = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied to clipboard!');
        });
      }
    }
  };

  return (
    <header className={`bg-white shadow-sm ${config.customStyles?.header || ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {config.title}
            </h1>
          </div>
          {isPostView && config.enableShare && (
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              aria-label="Share post"
            >
              <Share2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};