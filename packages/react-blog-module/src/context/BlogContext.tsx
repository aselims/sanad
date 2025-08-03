import React, { createContext, useContext, useState, useEffect } from 'react';
import { BlogConfig, BlogPost, UseBlogReturn } from '../types';

const BlogContext = createContext<UseBlogReturn | null>(null);

export const useBlog = (): UseBlogReturn => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

interface BlogProviderProps {
  config: BlogConfig;
  children: React.ReactNode;
}

export const BlogProvider: React.FC<BlogProviderProps> = ({ config, children }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPost, setCurrentPost] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const defaultFetchPosts = async (): Promise<BlogPost[]> => {
    const response = await fetch(`${config.postsPath}/posts.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }
    const data = await response.json();
    return data.posts || [];
  };

  const defaultFetchPost = async (slug: string): Promise<string> => {
    const response = await fetch(`${config.postsPath}/${slug}.md`);
    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.status}`);
    }
    return await response.text();
  };

  const fetchPosts = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const fetchFunction = config.fetchPosts || defaultFetchPosts;
      const fetchedPosts = await fetchFunction();
      setPosts(fetchedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchPost = async (slug: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const fetchFunction = config.fetchPost || defaultFetchPost;
      const content = await fetchFunction(slug);
      setCurrentPost(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch post');
    } finally {
      setLoading(false);
    }
  };

  const searchPosts = (query: string): BlogPost[] => {
    if (!query.trim()) return posts;
    
    const lowercaseQuery = query.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.excerpt.toLowerCase().includes(lowercaseQuery) ||
      post.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getPostsByTag = (tag: string): BlogPost[] => {
    return posts.filter(post => 
      post.tags?.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
    );
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const value: UseBlogReturn = {
    posts,
    currentPost,
    loading,
    error,
    config,
    fetchPosts,
    fetchPost,
    searchPosts,
    getPostsByTag
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};