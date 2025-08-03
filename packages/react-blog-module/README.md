# @sanad/react-blog-module

A pluggable, customizable React blog module that can be easily integrated into any React application.

## Features

- 📝 Markdown-based blog posts
- 🔍 Built-in search functionality
- 🏷️ Tag-based filtering
- 📱 Responsive design
- 🔌 Plugin system for extensibility
- 🎨 Customizable themes
- ⚡ Fast and lightweight
- 🚀 TypeScript support

## Installation

```bash
npm install @sanad/react-blog-module
```

## Peer Dependencies

Make sure you have these installed in your project:

```bash
npm install react react-dom react-router-dom react-markdown lucide-react
```

## Quick Start

### Basic Setup

```tsx
import React from 'react';
import { Blog, BlogConfig } from '@sanad/react-blog-module';

const config: BlogConfig = {
  title: 'My Blog',
  basePath: '/blog',
  postsPath: '/blog', // Path to your blog content
  enableSearch: true,
  enableTags: true,
  enableShare: true
};

function MyBlog() {
  return <Blog config={config} />;
}
```

### With React Router

```tsx
import { Routes, Route } from 'react-router-dom';
import { Blog, BlogConfig } from '@sanad/react-blog-module';

const config: BlogConfig = {
  title: 'My Blog',
  basePath: '/blog',
  postsPath: '/blog'
};

function App() {
  return (
    <Routes>
      <Route path="/blog" element={<Blog config={config} />} />
      <Route path="/blog/:slug" element={<Blog config={config} />} />
    </Routes>
  );
}
```

## Configuration

### BlogConfig Options

```tsx
interface BlogConfig {
  title: string;                    // Blog title
  basePath: string;                 // Base URL path for blog routes
  postsPath: string;                // Path to blog content files
  theme?: BlogTheme;                // Custom theme
  enableSearch?: boolean;           // Enable search functionality
  enableTags?: boolean;             // Enable tag filtering
  enableShare?: boolean;            // Enable sharing buttons
  postsPerPage?: number;            // Posts per page (future feature)
  dateFormat?: string;              // Date format string
  customStyles?: {                  // Custom CSS classes
    header?: string;
    post?: string;
    list?: string;
  };
  onNavigateBack?: () => void;      // Custom back navigation handler
  onPostClick?: (slug: string) => void; // Custom post click handler
  fetchPosts?: () => Promise<BlogPost[]>; // Custom posts fetcher
  fetchPost?: (slug: string) => Promise<string>; // Custom post fetcher
}
```

## Content Structure

### Blog Posts JSON

Create a `posts.json` file in your blog content directory:

```json
{
  "posts": [
    {
      "title": "My First Post",
      "slug": "my-first-post",
      "date": "2023-10-15",
      "excerpt": "This is a brief description of my first post.",
      "author": "John Doe",
      "tags": ["react", "blog"],
      "readTime": "5 min read"
    }
  ]
}
```

### Markdown Files

Create corresponding `.md` files for each post:

```markdown
# My First Post

*Published on October 15, 2023*

This is the content of my first blog post written in Markdown.

## Features

- Easy to write
- Supports code blocks
- Images and links
```

## Plugins

The blog module supports a plugin system for extending functionality.

### Built-in Plugins

- **ReadingTimePlugin**: Automatically calculates reading time
- **SocialSharePlugin**: Adds social sharing buttons
- **RelatedPostsPlugin**: Shows related posts based on tags

### Using Plugins

```tsx
import { 
  Blog, 
  BlogConfig, 
  applyPluginPreset,
  blogPluginManager,
  ReadingTimePlugin 
} from '@sanad/react-blog-module';

// Use a preset
applyPluginPreset('standard'); // minimal, standard, full

// Or register individual plugins
blogPluginManager.register(ReadingTimePlugin);
```

### Creating Custom Plugins

```tsx
import { BlogPlugin } from '@sanad/react-blog-module';

const MyCustomPlugin: BlogPlugin = {
  name: 'MyCustomPlugin',
  version: '1.0.0',
  description: 'Adds custom functionality',
  
  transformPost: (post) => {
    // Transform post data
    return { ...post, customField: 'value' };
  },
  
  renderPostFooter: (post) => {
    return <div>Custom footer content</div>;
  }
};

blogPluginManager.register(MyCustomPlugin);
```

## Themes

### Using Built-in Themes

```tsx
import { blogThemes } from '@sanad/react-blog-module';

const config: BlogConfig = {
  // ... other config
  theme: blogThemes.minimal // default, minimal, modern
};
```

### Custom Theme

```tsx
const customTheme = {
  colors: {
    primary: '#4f46e5',
    secondary: '#6b7280',
    text: '#111827',
    background: '#f9fafb',
    accent: '#10b981'
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    headingSize: '1.875rem',
    bodySize: '1rem'
  }
};

const config: BlogConfig = {
  // ... other config
  theme: customTheme
};
```

## Custom Data Sources

You can provide custom functions to fetch blog data:

```tsx
const config: BlogConfig = {
  // ... other config
  fetchPosts: async () => {
    const response = await fetch('/api/posts');
    return response.json();
  },
  
  fetchPost: async (slug) => {
    const response = await fetch(`/api/posts/${slug}`);
    return response.text();
  }
};
```

## Component Customization

You can use individual components for more control:

```tsx
import { 
  BlogProvider, 
  BlogHeader, 
  BlogList, 
  BlogPost,
  useBlog 
} from '@sanad/react-blog-module';

function CustomBlog() {
  return (
    <BlogProvider config={config}>
      <div className="custom-layout">
        <BlogHeader />
        <main>
          <BlogList onPostClick={handlePostClick} />
        </main>
      </div>
    </BlogProvider>
  );
}
```

## API Reference

### Components

- `Blog` - Main blog component
- `BlogProvider` - Context provider for blog data
- `BlogHeader` - Blog header with navigation
- `BlogList` - List of blog posts with search and filtering
- `BlogPost` - Individual blog post viewer
- `BlogPostCard` - Individual post card component
- `BlogFooter` - Blog footer component

### Hooks

- `useBlog()` - Access blog context and data
- `useBlogRoutes()` - Generate blog routes for React Router

### Plugin System

- `blogPluginManager` - Global plugin manager instance
- `applyPluginPreset()` - Apply predefined plugin presets
- `createPlugin()` - Helper for creating plugins

## Examples

### Integration with Next.js

```tsx
// pages/blog/[...slug].tsx
import { Blog, BlogConfig } from '@sanad/react-blog-module';

const config: BlogConfig = {
  title: 'My Blog',
  basePath: '/blog',
  postsPath: '/api/blog'
};

export default function BlogPage() {
  return <Blog config={config} />;
}
```

### Integration with Gatsby

```tsx
// src/pages/blog.tsx
import { Blog, BlogConfig } from '@sanad/react-blog-module';

const config: BlogConfig = {
  title: 'My Blog',
  basePath: '/blog',
  postsPath: '/static/blog'
};

export default function BlogPage() {
  return <Blog config={config} />;
}
```

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.