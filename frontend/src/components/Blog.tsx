import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';

interface BlogProps {
  onNavigateBack: () => void;
}

interface BlogPost {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
}

export function Blog({ onNavigateBack }: BlogProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postContent, setPostContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the list of blog posts
  useEffect(() => {
    // Fetch posts from the JSON file
    fetch('/blog/posts.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch blog posts: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        setPosts(data.posts);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
        setLoading(false);
      });
  }, []);

  // Fetch a specific blog post content when slug changes
  useEffect(() => {
    if (slug) {
      setLoading(true);
      
      // Fetch the Markdown file from the public directory
      fetch(`/blog/${slug}.md`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch blog post: ${response.status} ${response.statusText}`);
          }
          return response.text();
        })
        .then(content => {
          setPostContent(content);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching blog post:', err);
          setError('Failed to load blog post. Please try again later.');
          setLoading(false);
        });
    }
  }, [slug]);

  const handlePostClick = (postSlug: string) => {
    navigate(`/blog/${postSlug}`);
  };

  const handleShare = () => {
    if (slug) {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={onNavigateBack}
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Saned Blog</h1>
            </div>
            {slug && (
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
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            {error}
          </div>
        ) : slug ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <button 
                onClick={() => navigate('/blog')}
                className="mb-6 text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to all posts
              </button>
              
              <article className="prose prose-indigo max-w-none">
                <ReactMarkdown>{postContent}</ReactMarkdown>
              </article>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <div 
                key={post.slug}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handlePostClick(post.slug)}
              >
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <button 
                    className="text-indigo-600 font-medium hover:text-indigo-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePostClick(post.slug);
                    }}
                  >
                    Read more
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500">© 2023 Saned. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button onClick={onNavigateBack} className="text-gray-500 hover:text-gray-700">Back to Home</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 