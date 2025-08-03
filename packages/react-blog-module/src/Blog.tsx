import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogProvider } from './context/BlogContext';
import { BlogHeader } from './components/BlogHeader';
import { BlogList } from './components/BlogList';
import { BlogPost } from './components/BlogPost';
import { BlogFooter } from './components/BlogFooter';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { useBlog } from './context/BlogContext';
import { BlogConfig } from './types';

interface BlogProps {
  config: BlogConfig;
  footerContent?: React.ReactNode;
}

// Inner component that uses the blog context
const BlogContent: React.FC<{ footerContent?: React.ReactNode }> = ({ footerContent }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentPost, loading, error, fetchPost, config } = useBlog();

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug, fetchPost]);

  const handlePostClick = (postSlug: string) => {
    if (config.onPostClick) {
      config.onPostClick(postSlug);
    } else {
      navigate(`${config.basePath}/${postSlug}`);
    }
  };

  const handleBackToPosts = () => {
    navigate(config.basePath);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader isPostView={!!slug} onShare={handleShare} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage 
            message={error} 
            onRetry={() => slug ? fetchPost(slug) : window.location.reload()} 
          />
        ) : slug ? (
          <BlogPost 
            content={currentPost} 
            onBackToPosts={handleBackToPosts}
          />
        ) : (
          <BlogList onPostClick={handlePostClick} />
        )}
      </main>
      
      <BlogFooter customContent={footerContent} />
    </div>
  );
};

// Main Blog component that provides context
export const Blog: React.FC<BlogProps> = ({ config, footerContent }) => {
  return (
    <BlogProvider config={config}>
      <BlogContent footerContent={footerContent} />
    </BlogProvider>
  );
};