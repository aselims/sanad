import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { BlogPostCard } from './BlogPostCard';
import { useBlog } from '../context/BlogContext';
import { BlogPost } from '../types';

interface BlogListProps {
  onPostClick: (slug: string) => void;
}

export const BlogList: React.FC<BlogListProps> = ({ onPostClick }) => {
  const { posts, searchPosts, config } = useBlog();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  const filteredPosts = React.useMemo(() => {
    let filtered = posts;
    
    if (searchQuery) {
      filtered = searchPosts(searchQuery);
    }
    
    if (selectedTag) {
      filtered = filtered.filter(post => 
        post.tags?.includes(selectedTag)
      );
    }
    
    return filtered;
  }, [posts, searchQuery, selectedTag, searchPosts]);

  // Get all unique tags from posts
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => {
      post.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [posts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? '' : tag);
  };

  return (
    <div className={config.customStyles?.list || ''}>
      {/* Search and Filters */}
      {(config.enableSearch || config.enableTags) && (
        <div className="mb-8 space-y-4">
          {config.enableSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}
          
          {config.enableTags && allTags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by tags:</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTag === tag
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchQuery || selectedTag ? 'No posts found matching your criteria.' : 'No posts available.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <BlogPostCard 
              key={post.slug} 
              post={post} 
              onClick={onPostClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};