import OpenAI from 'openai';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Challenge } from '../entities/Challenge';
import { Partnership } from '../entities/Partnership';
import { Idea } from '../entities/Idea';
import logger from '../utils/logger';

/**
 * Calculate fuzzy match score between two strings
 * Uses Levenshtein distance approach for typo tolerance
 */
function calculateFuzzyScore(term: string, text: string): number {
  const termLower = term.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match gets highest score
  if (textLower.includes(termLower)) {
    return 1.0;
  }
  
  // Calculate similarity for fuzzy matching
  const words = textLower.split(/\s+/);
  let maxSimilarity = 0;
  
  words.forEach(word => {
    const similarity = calculateStringSimilarity(termLower, word);
    maxSimilarity = Math.max(maxSimilarity, similarity);
  });
  
  // Return fuzzy score if similarity is above threshold
  return maxSimilarity >= 0.7 ? maxSimilarity * 0.8 : 0; // Reduce fuzzy match weight
}

/**
 * Calculate string similarity using a simple algorithm
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  if (str1.length === 0) return str2.length === 0 ? 1 : 0;
  if (str2.length === 0) return 0;
  
  const maxLength = Math.max(str1.length, str2.length);
  const editDistance = levenshteinDistance(str1, str2);
  
  return (maxLength - editDistance) / maxLength;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Remove duplicate results and apply relevance threshold filtering
 */
function deduplicateAndFilterResults(results: SearchResult[], minRelevanceScore: number = 1.0): SearchResult[] {
  const seen = new Set<string>();
  const filtered: SearchResult[] = [];
  
  results.forEach(result => {
    // Skip if relevance score is too low
    if (result.relevanceScore < minRelevanceScore) {
      return;
    }
    
    // Create a unique key based on id and type
    const key = `${result.type}-${result.id}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      filtered.push(result);
    }
  });
  
  return filtered;
}

// Initialize OpenAI client with Groq API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

interface SearchResult {
  id: string;
  title?: string;
  name?: string;
  description: string;
  type: 'user' | 'challenge' | 'partnership' | 'idea';
  relevanceScore: number;
  matchedFields: string[];
  highlights?: { [key: string]: string[] };
}

/**
 * Process a search query using Llama 3.1 8B to extract intent and key entities
 * @param query The user's search query
 * @returns Processed search information with extracted entities and intent
 */
async function processQueryWithAI(query: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that helps extract search intent and key entities from user queries.
          Your task is to analyze the query and identify:
          1. The main intent (e.g., finding people, projects, challenges, partnerships, ideas, innovations)
          2. Key entities mentioned (names, skills, industries, technologies, concepts, etc.)
          3. Any implied filters (e.g., status, type, role, stage, category)
          4. Synonyms and related terms to expand search coverage
          
          Format your response as JSON with the following structure:
          {
            "intent": "string describing the primary search intent (people/challenges/partnerships/ideas/general)",
            "entities": ["array of key entities extracted"],
            "synonyms": ["array of synonyms and related terms"],
            "filters": {"field": "value"} - any implied filters,
            "expandedQuery": "an expanded version of the query with synonyms and related terms",
            "searchType": "specific type if clearly indicated: user/challenge/partnership/idea or general"
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
        synonyms: [],
        filters: {},
        expandedQuery: query,
        searchType: 'general'
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
      synonyms: [],
      filters: {},
      expandedQuery: query,
      searchType: 'general'
    };
  }
}

/**
 * Search for users, challenges, partnerships, and ideas using AI-enhanced query processing
 * @param query The user's search query
 * @returns Ranked search results with relevance scores
 */
export async function aiSearch(query: string): Promise<SearchResult[]> {
  try {
    // Process the query with AI to extract intent and entities
    const processedQuery = await processQueryWithAI(query);
    
    // Get data from database - select only needed columns to avoid mapping issues
    const users = await AppDataSource.getRepository(User)
      .createQueryBuilder('user')
      .select(['user.id', 'user.firstName', 'user.lastName', 'user.email', 'user.organization', 'user.bio', 'user.role'])
      .getMany();
    
    const challenges = await AppDataSource.getRepository(Challenge)
      .createQueryBuilder('challenge')
      .select(['challenge.id', 'challenge.title', 'challenge.description', 'challenge.organization', 'challenge.status'])
      .getMany();
      
    const partnerships = await AppDataSource.getRepository(Partnership)
      .createQueryBuilder('partnership')
      .select([
        'partnership.id', 'partnership.title', 'partnership.description', 
        'partnership.participants', 'partnership.status', 'partnership.duration', 
        'partnership.resources', 'partnership.expectedOutcomes', 'partnership.initiatorId'
      ])
      .getMany();
    
    const ideas = await AppDataSource.getRepository(Idea)
      .createQueryBuilder('idea')
      .select([
        'idea.id', 'idea.title', 'idea.description', 'idea.participants',
        'idea.status', 'idea.category', 'idea.stage', 'idea.targetAudience',
        'idea.potentialImpact', 'idea.resourcesNeeded'
      ])
      .getMany();
    
    // Prepare search terms from processed query
    const searchTerms = [
      ...processedQuery.entities,
      ...(processedQuery.synonyms || []),
      processedQuery.expandedQuery,
      query // Include original query as well
    ].filter(Boolean).filter((term, index, arr) => arr.indexOf(term) === index); // Remove duplicates
    
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
        
        // Check each field for exact and fuzzy matches
        const firstNameScore = calculateFuzzyScore(term, user.firstName);
        if (firstNameScore > 0) {
          score += 5 * firstNameScore;
          matchedFields.push('firstName');
          highlights.firstName = [user.firstName];
        }
        
        const lastNameScore = calculateFuzzyScore(term, user.lastName);
        if (lastNameScore > 0) {
          score += 5 * lastNameScore;
          matchedFields.push('lastName');
          highlights.lastName = [user.lastName];
        }
        
        const emailScore = calculateFuzzyScore(term, user.email);
        if (emailScore > 0) {
          score += 3 * emailScore;
          matchedFields.push('email');
          highlights.email = [user.email];
        }
        
        if (user.organization) {
          const orgScore = calculateFuzzyScore(term, user.organization);
          if (orgScore > 0) {
            score += 4 * orgScore;
            matchedFields.push('organization');
            highlights.organization = [user.organization];
          }
        }
        
        if (user.bio) {
          const bioScore = calculateFuzzyScore(term, user.bio);
          if (bioScore > 0) {
            score += 2 * bioScore;
            matchedFields.push('bio');
            
            // Extract a snippet around the match for exact matches
            if (bioScore === 1.0) {
              const bioLower = user.bio.toLowerCase();
              const index = bioLower.indexOf(termLower);
              if (index !== -1) {
                const start = Math.max(0, index - 20);
                const end = Math.min(user.bio.length, index + termLower.length + 20);
                highlights.bio = [`...${user.bio.substring(start, end)}...`];
              }
            }
          }
        }
        
        const roleScore = calculateFuzzyScore(term, user.role);
        if (roleScore > 0) {
          score += 4 * roleScore;
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
    partnerships.forEach((partnership: any) => {
      const partnershipText = `${partnership.title} ${partnership.description} ${partnership.participants?.join(' ') || ''}`.toLowerCase();
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
        if (partnership.participants) {
          partnership.participants.forEach((participant: any) => {
            if (participant.toLowerCase().includes(termLower)) {
              score += 3;
              matchedFields.push('participants');
              if (!highlights.participants) {
                highlights.participants = [];
              }
              highlights.participants.push(participant);
            }
          });
        }
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
    
    // Score ideas
    ideas.forEach(idea => {
      const ideaText = `${idea.title} ${idea.description} ${idea.category} ${idea.targetAudience} ${idea.potentialImpact} ${idea.resourcesNeeded || ''}`.toLowerCase();
      const matchedFields: string[] = [];
      const highlights: { [key: string]: string[] } = {};
      
      let score = 0;
      searchTerms.forEach(term => {
        const termLower = term.toLowerCase();
        
        if (idea.title.toLowerCase().includes(termLower)) {
          score += 6; // Higher weight for title matches in ideas
          matchedFields.push('title');
          highlights.title = [idea.title];
        }
        
        if (idea.description.toLowerCase().includes(termLower)) {
          score += 5; // High weight for description
          matchedFields.push('description');
          
          // Extract a snippet around the match
          const descLower = idea.description.toLowerCase();
          const index = descLower.indexOf(termLower);
          if (index !== -1) {
            const start = Math.max(0, index - 30);
            const end = Math.min(idea.description.length, index + termLower.length + 30);
            highlights.description = [`...${idea.description.substring(start, end)}...`];
          }
        }
        
        if (idea.category.toLowerCase().includes(termLower)) {
          score += 4;
          matchedFields.push('category');
          highlights.category = [idea.category];
        }
        
        if (idea.targetAudience.toLowerCase().includes(termLower)) {
          score += 3;
          matchedFields.push('targetAudience');
          highlights.targetAudience = [idea.targetAudience];
        }
        
        if (idea.potentialImpact.toLowerCase().includes(termLower)) {
          score += 4;
          matchedFields.push('potentialImpact');
          
          // Extract snippet
          const impactLower = idea.potentialImpact.toLowerCase();
          const index = impactLower.indexOf(termLower);
          if (index !== -1) {
            const start = Math.max(0, index - 20);
            const end = Math.min(idea.potentialImpact.length, index + termLower.length + 20);
            highlights.potentialImpact = [`...${idea.potentialImpact.substring(start, end)}...`];
          }
        }
        
        if (idea.resourcesNeeded?.toLowerCase().includes(termLower)) {
          score += 2;
          matchedFields.push('resourcesNeeded');
        }
        
        // Check participants array
        if (idea.participants) {
          idea.participants.forEach((participant: string) => {
            if (participant.toLowerCase().includes(termLower)) {
              score += 3;
              matchedFields.push('participants');
              if (!highlights.participants) {
                highlights.participants = [];
              }
              highlights.participants.push(participant);
            }
          });
        }
      });
      
      // Add intent-based scoring
      if (processedQuery.intent.toLowerCase().includes('idea') || 
          processedQuery.intent.toLowerCase().includes('innovation') ||
          processedQuery.intent.toLowerCase().includes('concept')) {
        score += 12; // High bonus for idea searches
      }
      
      // Apply filters from processed query
      if (processedQuery.filters.status && 
          idea.status.toLowerCase().includes(processedQuery.filters.status.toLowerCase())) {
        score += 8;
      }
      
      if (processedQuery.filters.stage && 
          idea.stage.toLowerCase().includes(processedQuery.filters.stage.toLowerCase())) {
        score += 8;
      }
      
      if (processedQuery.filters.category && 
          idea.category.toLowerCase().includes(processedQuery.filters.category.toLowerCase())) {
        score += 10;
      }
      
      if (score > 0) {
        results.push({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          type: 'idea',
          relevanceScore: score,
          matchedFields,
          highlights
        });
      }
    });
    
    // Remove duplicates and apply relevance filtering
    const filteredResults = deduplicateAndFilterResults(results, 1.5); // Minimum score of 1.5
    
    // Sort results by relevance score (descending) with secondary sort by type preference
    filteredResults.sort((a, b) => {
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      
      // Secondary sort: prefer certain types based on search intent
      const typePreference = { 'user': 4, 'idea': 3, 'challenge': 2, 'partnership': 1 };
      if (processedQuery.intent.toLowerCase().includes('people')) {
        return typePreference[a.type] - typePreference[b.type];
      }
      
      return 0;
    });
    
    // Limit results to top 50 to prevent overwhelming responses
    return filteredResults.slice(0, 50);
  } catch (error) {
    logger.error(`Error in AI search: ${error}`);
    throw error;
  }
} 