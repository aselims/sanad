import { AppDataSource } from '../config/data-source';
import logger from '../utils/logger';

export interface DatabaseSearchResult {
  id: string;
  title: string;
  description: string;
  entity_type: 'user' | 'challenge' | 'partnership' | 'idea';
  relevanceScore: number;
  created_at: Date;
}

/**
 * Perform database-optimized search using PostgreSQL full-text search
 * This serves as a fallback for the AI search or can be used directly
 */
export async function databaseSearch(query: string, limit: number = 50): Promise<DatabaseSearchResult[]> {
  try {
    const searchQuery = query.trim().replace(/\s+/g, ' & '); // Convert to tsquery format
    
    const rawQuery = `
      SELECT 
        entity_type,
        id,
        title,
        description,
        ts_rank(search_vector, to_tsquery('english', $1)) as relevance_score,
        created_at
      FROM v_searchable_content
      WHERE search_vector @@ to_tsquery('english', $1)
      ORDER BY relevance_score DESC, created_at DESC
      LIMIT $2
    `;
    
    const results = await AppDataSource.query(rawQuery, [searchQuery, limit]);
    
    return results.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      entity_type: row.entity_type,
      relevanceScore: parseFloat(row.relevance_score),
      created_at: row.created_at
    }));
    
  } catch (error) {
    logger.error(`Database search error: ${error}`);
    
    // Fallback to simpler search if full-text search fails
    return await fallbackSearch(query, limit);
  }
}

/**
 * Fallback search using ILIKE when full-text search fails
 */
async function fallbackSearch(query: string, limit: number): Promise<DatabaseSearchResult[]> {
  try {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const rawQuery = `
      SELECT 
        entity_type,
        id,
        title,
        description,
        1.0 as relevance_score,
        created_at
      FROM v_searchable_content
      WHERE 
        LOWER(title) LIKE $1 OR 
        LOWER(description) LIKE $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const results = await AppDataSource.query(rawQuery, [searchTerm, limit]);
    
    return results.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      entity_type: row.entity_type,
      relevanceScore: 1.0,
      created_at: row.created_at
    }));
    
  } catch (error) {
    logger.error(`Fallback search error: ${error}`);
    return [];
  }
}

/**
 * Search with faceted results - returns counts by entity type
 */
export async function searchWithFacets(query: string) {
  try {
    const searchQuery = query.trim().replace(/\s+/g, ' & ');
    
    const facetQuery = `
      SELECT 
        entity_type,
        COUNT(*) as count,
        AVG(ts_rank(search_vector, to_tsquery('english', $1))) as avg_relevance
      FROM v_searchable_content
      WHERE search_vector @@ to_tsquery('english', $1)
      GROUP BY entity_type
      ORDER BY avg_relevance DESC
    `;
    
    const facets = await AppDataSource.query(facetQuery, [searchQuery]);
    const results = await databaseSearch(query);
    
    return {
      results,
      facets: facets.map((f: any) => ({
        type: f.entity_type,
        count: parseInt(f.count),
        avgRelevance: parseFloat(f.avg_relevance)
      }))
    };
    
  } catch (error) {
    logger.error(`Faceted search error: ${error}`);
    return { results: [], facets: [] };
  }
}