import React from 'react';
import { BlogPlugin } from '../types';
import { BlogPost } from '../../types';

interface RelatedPostsProps {
  currentPost: BlogPost;
  allPosts: BlogPost[];
  maxPosts?: number;
}

const RelatedPostsComponent: React.FC<RelatedPostsProps> = ({ 
  currentPost, 
  allPosts, 
  maxPosts = 3 
}) => {
  // Find related posts based on shared tags
  const relatedPosts = React.useMemo(() => {
    if (!currentPost.tags || currentPost.tags.length === 0) {
      // If no tags, return most recent posts
      return allPosts
        .filter(post => post.slug !== currentPost.slug)
        .slice(0, maxPosts);
    }

    // Calculate similarity score based on shared tags
    const postsWithScore = allPosts
      .filter(post => post.slug !== currentPost.slug)
      .map(post => {
        const sharedTags = post.tags?.filter(tag => 
          currentPost.tags?.includes(tag)
        ) || [];
        
        return {
          post,
          score: sharedTags.length
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (postsWithScore.length >= maxPosts) {
      return postsWithScore.slice(0, maxPosts).map(item => item.post);
    }

    // If not enough related posts, fill with recent posts
    const relatedByTags = postsWithScore.map(item => item.post);
    const recentPosts = allPosts
      .filter(post => 
        post.slug !== currentPost.slug && 
        !relatedByTags.some(related => related.slug === post.slug)
      )
      .slice(0, maxPosts - relatedByTags.length);

    return [...relatedByTags, ...recentPosts];
  }, [currentPost, allPosts, maxPosts]);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Related Posts</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map(post => (
          <div 
            key={post.slug}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              // Navigate to the related post
              const event = new CustomEvent('blog-navigate', { 
                detail: { slug: post.slug } 
              });
              window.dispatchEvent(event);
            }}
          >
            <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
              {post.title}
            </h4>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {post.excerpt}
            </p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{new Date(post.date).toLocaleDateString()}</span>
              {post.readTime && <span>{post.readTime}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RelatedPostsPlugin: BlogPlugin = {
  name: 'RelatedPostsPlugin',
  version: '1.0.0',
  description: 'Shows related posts based on tags and content similarity',
  
  renderPostFooter: (post: BlogPost) => {
    // This would need access to all posts - in a real implementation,
    // you'd need to provide this through the plugin context
    return null; // Placeholder - would be implemented with proper context
  },
  
  settings: {
    maxPosts: 3,
    algorithm: 'tags', // 'tags', 'content', 'hybrid'
    showInPost: true,
    showInSidebar: false
  }
};