import React from 'react';
import { BlogPost } from '../types';

interface BlogPostCardProps {
  post: BlogPost;
  onClick: (slug: string) => void;
}

export const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, onClick }) => {
  const handleClick = () => {
    onClick(post.slug);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500">{formatDate(post.date)}</p>
          {post.readTime && (
            <span className="text-sm text-gray-500">{post.readTime}</span>
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-indigo-600">
          {post.title}
        </h2>
        
        {post.author && (
          <p className="text-sm text-gray-600 mb-2">By {post.author}</p>
        )}
        
        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <button 
          className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          Read more →
        </button>
      </div>
    </div>
  );
};