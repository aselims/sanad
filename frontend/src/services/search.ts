import api from './api';
import { searchInnovators } from './innovators';
import { searchCollaborations } from './collaborations';
import { Innovator, Collaboration } from '../types';

export interface SearchResult {
  id: string;
  title?: string;
  name?: string;
  description: string;
  type: 'user' | 'challenge' | 'partnership';
  relevanceScore?: number;
  matchedFields?: string[];
  highlights?: { [key: string]: string[] };
}

export interface SearchResults {
  innovators: Innovator[];
  collaborations: Collaboration[];
  aiResults?: SearchResult[];
}

/**
 * Perform a normal search using existing search functions
 * @param query Search query
 * @returns Promise with search results
 */
export const performNormalSearch = async (query: string): Promise<SearchResults> => {
  try {
    console.log(`Performing normal search for: "${query}"`);
    
    // Search for both innovators and collaborations in parallel
    const results = await Promise.allSettled([
      searchInnovators(query),
      searchCollaborations(query)
    ]);
    
    // Process results, handling potential failures
    const innovatorsResult = results[0];
    const collaborationsResult = results[1];
    
    const innovators = innovatorsResult.status === 'fulfilled' ? innovatorsResult.value : [];
    const collaborations = collaborationsResult.status === 'fulfilled' ? collaborationsResult.value : [];
    
    // Log any errors that occurred
    if (innovatorsResult.status === 'rejected') {
      console.error('Error searching innovators:', innovatorsResult.reason);
    }
    
    if (collaborationsResult.status === 'rejected') {
      console.error('Error searching collaborations:', collaborationsResult.reason);
    }
    
    return {
      innovators,
      collaborations,
      aiResults: [] // Empty AI results for normal search
    };
  } catch (error) {
    console.error('Error during normal search:', error);
    return {
      innovators: [],
      collaborations: [],
      aiResults: []
    };
  }
};

/**
 * Perform an AI-powered search using the new AI search endpoint
 * @param query Search query
 * @returns Promise with AI-enhanced search results
 */
export const performAISearch = async (query: string): Promise<SearchResults> => {
  try {
    console.log(`Performing AI search for: "${query}"`);
    
    // First get AI-specific results
    const aiResponse = await api.get(`/ai-search?q=${encodeURIComponent(query)}`);
    const aiResults = aiResponse.data.data as SearchResult[];
    
    // Also perform a normal search to ensure we have both types of results
    const normalResults = await performNormalSearch(query);
    
    // Convert AI results to the standard format for compatibility
    const aiInnovators: Innovator[] = [];
    const aiCollaborations: Collaboration[] = [];
    
    aiResults.forEach(result => {
      if (result.type === 'user') {
        // Convert to Innovator format
        aiInnovators.push({
          id: result.id,
          name: result.name || '',
          description: result.description,
          organization: result.highlights?.organization?.[0] || '',
          type: 'individual',
          expertise: [],
          tags: [],
          email: result.highlights?.email?.[0] || '',
          location: '',
          position: result.highlights?.role?.[0] || ''
        });
      } else {
        // Convert to Collaboration format
        aiCollaborations.push({
          id: result.id,
          title: result.title || '',
          description: result.description,
          participants: result.highlights?.participants || [],
          status: 'active',
          type: result.type as 'challenge' | 'partnership',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });
    
    // Combine AI-specific innovators with normal search innovators
    // Use a Map to deduplicate by ID
    const innovatorsMap = new Map<string, Innovator>();
    
    // Add normal search results first
    normalResults.innovators.forEach(innovator => {
      innovatorsMap.set(innovator.id, innovator);
    });
    
    // Add AI results, potentially overwriting normal results with the same ID
    aiInnovators.forEach(innovator => {
      innovatorsMap.set(innovator.id, innovator);
    });
    
    // Do the same for collaborations
    const collaborationsMap = new Map<string, Collaboration>();
    
    normalResults.collaborations.forEach(collab => {
      collaborationsMap.set(collab.id, collab);
    });
    
    aiCollaborations.forEach(collab => {
      collaborationsMap.set(collab.id, collab);
    });
    
    return {
      innovators: Array.from(innovatorsMap.values()),
      collaborations: Array.from(collaborationsMap.values()),
      aiResults
    };
  } catch (error) {
    console.error('Error during AI search:', error);
    
    // Fallback to normal search if AI search fails
    console.log('Falling back to normal search...');
    return performNormalSearch(query);
  }
}; 