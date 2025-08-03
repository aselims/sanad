// Plugin system exports
export { PluginManager, blogPluginManager } from './PluginManager';
export type { BlogPlugin, PluginManager as IPluginManager } from './types';

// Built-in plugins
export { ReadingTimePlugin } from './builtins/ReadingTimePlugin';
export { SocialSharePlugin } from './builtins/SocialSharePlugin';
export { RelatedPostsPlugin } from './builtins/RelatedPostsPlugin';

// Plugin utilities
export const createPlugin = (plugin: Partial<BlogPlugin> & { name: string; version: string }): BlogPlugin => {
  return {
    description: '',
    ...plugin
  };
};

// Plugin registration helper
export const registerBuiltinPlugins = () => {
  blogPluginManager.register(ReadingTimePlugin);
  blogPluginManager.register(SocialSharePlugin);
  blogPluginManager.register(RelatedPostsPlugin);
};

// Plugin preset configurations
export const pluginPresets = {
  minimal: [ReadingTimePlugin],
  standard: [ReadingTimePlugin, SocialSharePlugin],
  full: [ReadingTimePlugin, SocialSharePlugin, RelatedPostsPlugin]
};

export const applyPluginPreset = (preset: keyof typeof pluginPresets) => {
  const plugins = pluginPresets[preset];
  plugins.forEach(plugin => {
    blogPluginManager.register(plugin);
  });
};