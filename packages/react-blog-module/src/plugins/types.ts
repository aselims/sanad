import { BlogPost, BlogConfig } from '../types';

export interface BlogPlugin {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
  
  // Lifecycle hooks
  init?: (config: BlogConfig) => void | Promise<void>;
  destroy?: () => void | Promise<void>;
  
  // Data transformation hooks
  transformPost?: (post: BlogPost) => BlogPost | Promise<BlogPost>;
  transformPosts?: (posts: BlogPost[]) => BlogPost[] | Promise<BlogPost[]>;
  transformContent?: (content: string, post: BlogPost) => string | Promise<string>;
  
  // UI enhancement hooks
  renderPostHeader?: (post: BlogPost) => React.ReactNode;
  renderPostFooter?: (post: BlogPost) => React.ReactNode;
  renderSidebar?: () => React.ReactNode;
  renderCustomComponents?: () => Record<string, React.ComponentType<any>>;
  
  // Behavior hooks
  onPostClick?: (post: BlogPost) => void | boolean; // return false to prevent default
  onPostLoad?: (post: BlogPost, content: string) => void;
  onSearch?: (query: string, posts: BlogPost[]) => BlogPost[] | void;
  
  // Custom routes
  customRoutes?: Array<{
    path: string;
    component: React.ComponentType<any>;
  }>;
  
  // Settings
  settings?: Record<string, any>;
}

export interface PluginManager {
  plugins: Map<string, BlogPlugin>;
  register: (plugin: BlogPlugin) => void;
  unregister: (pluginName: string) => void;
  get: (pluginName: string) => BlogPlugin | undefined;
  getAll: () => BlogPlugin[];
  executeHook: <T>(hookName: keyof BlogPlugin, ...args: any[]) => T[];
  executeAsyncHook: <T>(hookName: keyof BlogPlugin, ...args: any[]) => Promise<T[]>;
}