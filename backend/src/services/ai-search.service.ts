import OpenAI from 'openai';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Challenge } from '../entities/Challenge';
import { Partnership } from '../entities/Partnership';
import logger from '../utils/logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SearchResult {
  id: string;
  title?: string;
  name?: string;
  description: string;
  type: 'user' | 'challenge' | 'partnership';
  relevanceScore: number;
  matchedFields: string[];
  highlights?: { [key: string]: string[] };
}

/**
 * Process a search query using GPT-4o Mini to extract intent and key entities
 * @param query The user's search query
 * @returns Processed search information with extracted entities and intent
 */
async function processQueryWithAI(query: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that helps extract search intent and key entities from user queries.
          Your task is to analyze the query and identify:
          1. The main intent (e.g., finding people, projects, challenges, partnerships)
          2. Key entities mentioned (names, skills, industries, etc.)
          3. Any implied filters (e.g., status, type, role)
          
          Format your response as JSON with the following structure:
          {
            "intent": "string describing the primary search intent",
            "entities": ["array of key entities extracted"],
            "filters": {"field": "value"} - any implied filters,
            "expandedQuery": "an expanded version of the query that might catch more relevant results"
          }`
        },
        {
          role: 'user',
          content: query
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      logger.warn(`Empty response from OpenAI for query: ${query}`);
      return {
        intent: 'search',
        entities: [query],
        filters: {},
        expandedQuery: query
      };
    }
    
    const result = JSON.parse(content);
    logger.info(`AI processed query: ${query} -> ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    logger.error(`Error processing query with AI: ${error}`);
    // Return a basic structure if AI processing fails
    return {
      intent: 'search',
      entities: [query],
      filters: {},
      expandedQuery: query
    };
  }
}

/**
 * Search for users, challenges, and partnerships using AI-enhanced query processing
 * @param query The user's search query
 * @returns Ranked search results with relevance scores
 */
export async function aiSearch(query: string): Promise<SearchResult[]> {
  try {
    // Process the query with AI to extract intent and entities
    const processedQuery = await processQueryWithAI(query);
    
    // Get data from database
    const users = await AppDataSource.getRepository(User).find();
    const challenges = await AppDataSource.getRepository(Challenge).find();
    const partnerships = await AppDataSource.getRepository(Partnership).find();
    
    // Prepare search terms from processed query
    const searchTerms = [
      ...processedQuery.entities,
      processedQuery.expandedQuery
    ].filter(Boolean);
    
    // Score and rank results
    const results: SearchResult[] = [];
    
    // Score users
    users.forEach(user => {
      const userText = `${user.firstName} ${user.lastName} ${user.email} ${user.organization || ''} ${user.bio || ''} ${user.role}`.toLowerCase();
      const matchedFields: string[] = [];
      const highlights: { [key: string]: string[] } = {};
      
      let score = 0;
      searchTerms.forEach(term => {
        const termLower = term.toLowerCase();
        
        // Check each field for matches
        if (user.firstName.toLowerCase().includes(termLower)) {
          score += 5;
          matchedFields.push('firstName');
          highlights.firstName = [user.firstName];
        }
        
        if (user.lastName.toLowerCase().includes(termLower)) {
          score += 5;
          matchedFields.push('lastName');
          highlights.lastName = [user.lastName];
        }
        
        if (user.email.toLowerCase().includes(termLower)) {
          score += 3;
          matchedFields.push('email');
          highlights.email = [user.email];
        }
        
        if (user.organization?.toLowerCase().includes(termLower)) {
          score += 4;
          matchedFields.push('organization');
          highlights.organization = [user.organization];
        }
        
        if (user.bio?.toLowerCase().includes(termLower)) {
          score += 2;
          matchedFields.push('bio');
          
          // Extract a snippet around the match
          const bioLower = user.bio.toLowerCase();
          const index = bioLower.indexOf(termLower);
          if (index !== -1) {
            const start = Math.max(0, index - 20);
            const end = Math.min(user.bio.length, index + termLower.length + 20);
            highlights.bio = [`...${user.bio.substring(start, end)}...`];
          }
        }
        
        if (user.role.toLowerCase().includes(termLower)) {
          score += 4;
          matchedFields.push('role');
          highlights.role = [user.role];
        }
      });
      
      // Add intent-based scoring
      if (processedQuery.intent.toLowerCase().includes('people') || 
          processedQuery.intent.toLowerCase().includes('user') ||
          processedQuery.intent.toLowerCase().includes('innovator')) {
        score += 10;
      }
      
      // Apply any filters from the processed query
      if (processedQuery.filters.role && 
          user.role.toLowerCase().includes(processedQuery.filters.role.toLowerCase())) {
        score += 8;
      }
      
      if (score > 0) {
        results.push({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          description: user.bio || `${user.firstName} ${user.lastName} - ${user.role} at ${user.organization || 'Unknown'}`,
          type: 'user',
          relevanceScore: score,
          matchedFields,
          highlights
        });
      }
    });
    
    // Score challenges
    challenges.forEach(challenge => {
      const challengeText = `${challenge.title} ${challenge.description} ${challenge.organization}`.toLowerCase();
      const matchedFields: string[] = [];
      const highlights: { [key: string]: string[] } = {};
      
      let score = 0;
      searchTerms.forEach(term => {
        const termLower = term.toLowerCase();
        
        if (challenge.title.toLowerCase().includes(termLower)) {
          score += 5;
          matchedFields.push('title');
          highlights.title = [challenge.title];
        }
        
        if (challenge.description.toLowerCase().includes(termLower)) {
          score += 4;
          matchedFields.push('description');
          
          // Extract a snippet around the match
          const descLower = challenge.description.toLowerCase();
          const index = descLower.indexOf(termLower);
          if (index !== -1) {
            const start = Math.max(0, index - 20);
            const end = Math.min(challenge.description.length, index + termLower.length + 20);
            highlights.description = [`...${challenge.description.substring(start, end)}...`];
          }
        }
        
        if (challenge.organization.toLowerCase().includes(termLower)) {
          score += 3;
          matchedFields.push('organization');
          highlights.organization = [challenge.organization];
        }
      });
      
      // Add intent-based scoring
      if (processedQuery.intent.toLowerCase().includes('challenge') || 
          processedQuery.intent.toLowerCase().includes('project')) {
        score += 10;
      }
      
      // Apply any filters from the processed query
      if (processedQuery.filters.status && 
          challenge.status.toLowerCase().includes(processedQuery.filters.status.toLowerCase())) {
        score += 8;
      }
      
      if (score > 0) {
        results.push({
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          type: 'challenge',
          relevanceScore: score,
          matchedFields,
          highlights
        });
      }
    });
    
    // Score partnerships
    partnerships.forEach(partnership => {
      const partnershipText = `${partnership.title} ${partnership.description} ${partnership.participants.join(' ')}`.toLowerCase();
      const matchedFields: string[] = [];
      const highlights: { [key: string]: string[] } = {};
      
      let score = 0;
      searchTerms.forEach(term => {
        const termLower = term.toLowerCase();
        
        if (partnership.title.toLowerCase().includes(termLower)) {
          score += 5;
          matchedFields.push('title');
          highlights.title = [partnership.title];
        }
        
        if (partnership.description.toLowerCase().includes(termLower)) {
          score += 4;
          matchedFields.push('description');
          
          // Extract a snippet around the match
          const descLower = partnership.description.toLowerCase();
          const index = descLower.indexOf(termLower);
          if (index !== -1) {
            const start = Math.max(0, index - 20);
            const end = Math.min(partnership.description.length, index + termLower.length + 20);
            highlights.description = [`...${partnership.description.substring(start, end)}...`];
          }
        }
        
        // Check if any participant matches
        partnership.participants.forEach(participant => {
          if (participant.toLowerCase().includes(termLower)) {
            score += 3;
            matchedFields.push('participants');
            if (!highlights.participants) {
              highlights.participants = [];
            }
            highlights.participants.push(participant);
          }
        });
      });
      
      // Add intent-based scoring
      if (processedQuery.intent.toLowerCase().includes('partnership') || 
          processedQuery.intent.toLowerCase().includes('collaboration')) {
        score += 10;
      }
      
      // Apply any filters from the processed query
      if (processedQuery.filters.status && 
          partnership.status.toLowerCase().includes(processedQuery.filters.status.toLowerCase())) {
        score += 8;
      }
      
      if (score > 0) {
        results.push({
          id: partnership.id,
          title: partnership.title,
          description: partnership.description,
          type: 'partnership',
          relevanceScore: score,
          matchedFields,
          highlights
        });
      }
    });
    
    // Sort results by relevance score (descending)
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return results;
  } catch (error) {
    logger.error(`Error in AI search: ${error}`);
    throw error;
  }
} 