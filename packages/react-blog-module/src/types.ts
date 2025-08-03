export interface BlogPost {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  author?: string;
  tags?: string[];
  featured?: boolean;
  readTime?: string;
}

export interface BlogConfig {
  title: string;
  basePath: string;
  postsPath: string;
  theme?: BlogTheme;
  enableSearch?: boolean;
  enableTags?: boolean;
  enableShare?: boolean;
  postsPerPage?: number;
  dateFormat?: string;
  customStyles?: {
    header?: string;
    post?: string;
    list?: string;
  };
  onNavigateBack?: () => void;
  onPostClick?: (slug: string) => void;
  fetchPosts?: () => Promise<BlogPost[]>;
  fetchPost?: (slug: string) => Promise<string>;
}

export interface BlogTheme {
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    headingSize: string;
    bodySize: string;
  };
}

export interface BlogProviderProps {
  config: BlogConfig;
  children: React.ReactNode;
}

export interface UseBlogReturn {
  posts: BlogPost[];
  currentPost: string;
  loading: boolean;
  error: string | null;
  config: BlogConfig;
  fetchPosts: () => Promise<void>;
  fetchPost: (slug: string) => Promise<void>;
  searchPosts: (query: string) => BlogPost[];
  getPostsByTag: (tag: string) => BlogPost[];
}