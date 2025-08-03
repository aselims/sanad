import { BlogPlugin, PluginManager as IPluginManager } from './types';

export class PluginManager implements IPluginManager {
  public plugins: Map<string, BlogPlugin> = new Map();

  register(plugin: BlogPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already registered. Overwriting...`);
    }
    
    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin ${plugin.name} depends on ${dep}, but it's not registered`);
        }
      }
    }
    
    this.plugins.set(plugin.name, plugin);
    
    // Initialize plugin if it has an init hook
    if (plugin.init) {
      try {
        plugin.init({} as any); // Config will be passed later when Blog is initialized
      } catch (error) {
        console.error(`Failed to initialize plugin ${plugin.name}:`, error);
      }
    }
  }

  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (plugin && plugin.destroy) {
      try {
        plugin.destroy();
      } catch (error) {
        console.error(`Failed to destroy plugin ${pluginName}:`, error);
      }
    }
    this.plugins.delete(pluginName);
  }

  get(pluginName: string): BlogPlugin | undefined {
    return this.plugins.get(pluginName);
  }

  getAll(): BlogPlugin[] {
    return Array.from(this.plugins.values());
  }

  executeHook<T>(hookName: keyof BlogPlugin, ...args: any[]): T[] {
    const results: T[] = [];
    
    for (const plugin of this.plugins.values()) {
      const hook = plugin[hookName];
      if (typeof hook === 'function') {
        try {
          const result = hook.apply(plugin, args);
          if (result !== undefined) {
            results.push(result);
          }
        } catch (error) {
          console.error(`Error executing hook ${String(hookName)} in plugin ${plugin.name}:`, error);
        }
      }
    }
    
    return results;
  }

  async executeAsyncHook<T>(hookName: keyof BlogPlugin, ...args: any[]): Promise<T[]> {
    const results: T[] = [];
    
    for (const plugin of this.plugins.values()) {
      const hook = plugin[hookName];
      if (typeof hook === 'function') {
        try {
          const result = await hook.apply(plugin, args);
          if (result !== undefined) {
            results.push(result);
          }
        } catch (error) {
          console.error(`Error executing async hook ${String(hookName)} in plugin ${plugin.name}:`, error);
        }
      }
    }
    
    return results;
  }
}

// Global plugin manager instance
export const blogPluginManager = new PluginManager();