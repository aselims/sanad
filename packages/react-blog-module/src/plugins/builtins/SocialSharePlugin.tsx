import React from 'react';
import { Facebook, Twitter, Linkedin, Link } from 'lucide-react';
import { BlogPlugin } from '../types';
import { BlogPost } from '../../types';

interface SocialShareProps {
  post: BlogPost;
  url?: string;
}

const SocialShareComponent: React.FC<SocialShareProps> = ({ post, url = window.location.href }) => {
  const shareText = `Check out this post: ${post.title}`;
  
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  return (
    <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-gray-200">
      <span className="text-sm font-medium text-gray-700">Share:</span>
      
      <a
        href={shareUrls.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </a>
      
      <a
        href={shareUrls.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </a>
      
      <a
        href={shareUrls.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </a>
      
      <button
        onClick={copyToClipboard}
        className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        aria-label="Copy link"
      >
        <Link className="h-4 w-4" />
      </button>
    </div>
  );
};

export const SocialSharePlugin: BlogPlugin = {
  name: 'SocialSharePlugin',
  version: '1.0.0',
  description: 'Adds social sharing buttons to blog posts',
  
  renderPostFooter: (post: BlogPost) => {
    return <SocialShareComponent post={post} />;
  },
  
  settings: {
    platforms: ['twitter', 'facebook', 'linkedin', 'copy'],
    showInList: false,
    showInPost: true
  }
};