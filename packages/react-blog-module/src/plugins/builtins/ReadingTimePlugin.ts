import { BlogPlugin } from '../types';
import { BlogPost } from '../../types';

export const ReadingTimePlugin: BlogPlugin = {
  name: 'ReadingTimePlugin',
  version: '1.0.0',
  description: 'Automatically calculates and adds reading time to blog posts',
  
  transformPost: (post: BlogPost): BlogPost => {
    if (!post.readTime) {
      // Estimate reading time based on word count
      // Average reading speed: 200-250 words per minute
      const wordCount = post.excerpt.split(/\s+/).length;
      const readingTimeMinutes = Math.ceil(wordCount / 200);
      
      return {
        ...post,
        readTime: `${readingTimeMinutes} min read`
      };
    }
    return post;
  },
  
  transformContent: (content: string, post: BlogPost): string => {
    // Calculate reading time for full content
    const wordCount = content.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    
    // Add reading time to the beginning of the content if not already present
    if (!content.includes('reading time')) {
      const readingTimeHeader = `*Reading time: ${readingTimeMinutes} minutes*\n\n`;
      return readingTimeHeader + content;
    }
    
    return content;
  }
};