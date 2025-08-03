// Main components
export { Blog } from './Blog';
export { BlogProvider, useBlog } from './context/BlogContext';

// Individual components for customization
export { BlogHeader } from './components/BlogHeader';
export { BlogList } from './components/BlogList';
export { BlogPost } from './components/BlogPost';
export { BlogPostCard } from './components/BlogPostCard';
export { BlogFooter } from './components/BlogFooter';
export { LoadingSpinner } from './components/LoadingSpinner';
export { ErrorMessage } from './components/ErrorMessage';

// Hooks and utilities
export { useBlogRoutes, withBlogRoutes } from './hooks/useBlogRoutes';

// Types
export type {
  BlogPost as BlogPostType,
  BlogConfig,
  BlogTheme,
  BlogProviderProps,
  UseBlogReturn
} from './types';

// Default configurations
export const defaultBlogConfig: Partial<BlogConfig> = {
  title: 'Blog',
  basePath: '/blog',
  postsPath: '/blog',
  enableSearch: true,
  enableTags: true,
  enableShare: true,
  postsPerPage: 10,
  dateFormat: 'MMMM dd, yyyy'
};

// Theme presets
export const blogThemes = {
  default: {
    colors: {
      primary: '#4f46e5',
      secondary: '#6b7280',
      text: '#111827',
      background: '#f9fafb',
      accent: '#10b981'
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      headingSize: '1.875rem',
      bodySize: '1rem'
    }
  },
  minimal: {
    colors: {
      primary: '#000000',
      secondary: '#6b7280',
      text: '#374151',
      background: '#ffffff',
      accent: '#000000'
    },
    typography: {
      fontFamily: 'Georgia, serif',
      headingSize: '2rem',
      bodySize: '1.125rem'
    }
  },
  modern: {
    colors: {
      primary: '#7c3aed',
      secondary: '#a78bfa',
      text: '#1f2937',
      background: '#f8fafc',
      accent: '#06b6d4'
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      headingSize: '1.75rem',
      bodySize: '0.9375rem'
    }
  }
};