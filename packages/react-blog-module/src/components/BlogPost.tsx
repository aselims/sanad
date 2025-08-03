import React from 'react';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useBlog } from '../context/BlogContext';

interface BlogPostProps {
  content: string;
  onBackToPosts: () => void;
}

export const BlogPost: React.FC<BlogPostProps> = ({ content, onBackToPosts }) => {
  const { config } = useBlog();

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${config.customStyles?.post || ''}`}>
      <div className="p-6 md:p-8">
        <button 
          onClick={onBackToPosts}
          className="mb-6 text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to all posts
        </button>
        
        <article className="prose prose-indigo max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
};