import { Innovator } from '../types';

export interface MatchResult {
  innovator: Innovator;
  matchScore: number;
  sharedTags: string[];
  highlight: string;
}

// Helper function to convert array to readable string
function listToString(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, items.length - 1).join(', ');
  return `${otherItems}, and ${lastItem}`;
}

// Function to generate highlight text based on match data
function generateMatchHighlight(currentUser: Innovator, matchedUser: Innovator, sharedTags: string[]): string {
  // Different templates based on match type and shared attributes
  if (matchedUser.type === currentUser.type) {
    if (sharedTags.length > 0) {
      return `Both ${currentUser.type}s with shared interests in ${listToString(sharedTags)}.`;
    }
    return `Fellow ${currentUser.type} in ${matchedUser.organization}.`;
  }

  if (sharedTags.length >= 3) {
    return `Strong match with ${matchedUser.name} across multiple areas: ${listToString(sharedTags)}.`;
  }

  if (matchedUser.location === currentUser.location) {
    if (sharedTags.length > 0) {
      return `Based in ${matchedUser.location} with shared interests in ${listToString(sharedTags)}.`;
    }
    return `Located in ${matchedUser.location} with complementary expertise.`;
  }

  if (sharedTags.length > 0) {
    return `${matchedUser.name} shares your passion for ${listToString(sharedTags)}.`;
  }

  return `${matchedUser.name} works in ${matchedUser.organization} with complementary expertise.`;
}

// Main function to find potential matches
export function findPotentialMatches(currentUser: Innovator, allUsers: Innovator[]): MatchResult[] {
  
  if (!currentUser.tags || currentUser.tags.length === 0) {
    return [];
  }
  
  // Filter users, calculate scores, and create match results
  const matches = allUsers
    .filter(user => user.id !== currentUser.id)
    .map(user => {
      // Ensure the user has tags
      const userTags = user.tags || [];
      
      // Calculate shared tags
      const sharedTags = userTags.filter(tag => 
        currentUser.tags.some(userTag => 
          userTag.toLowerCase() === tag.toLowerCase()
        )
      );
      
      
      // Calculate tag similarity score (50% weight)
      // Avoid division by zero
      const tagSimilarity = currentUser.tags.length > 0 && userTags.length > 0 
        ? sharedTags.length / Math.max(currentUser.tags.length, userTags.length)
        : 0;
      
      // Calculate type compatibility score (30% weight)
      const typeScore = user.type === currentUser.type ? 1 : 0.5;
      
      // Calculate location proximity score (20% weight)
      const locationScore = user.location && currentUser.location && 
        user.location.toLowerCase() === currentUser.location.toLowerCase() ? 1 : 0.3;
      
      // Calculate final match score (weighted)
      const matchScore = Math.round(
        (tagSimilarity * 0.5 + typeScore * 0.3 + locationScore * 0.2) * 100
      );
      
      
      // Generate highlight
      const highlight = generateMatchHighlight(currentUser, user, sharedTags);
      
      return {
        innovator: user,
        matchScore,
        sharedTags,
        highlight
      };
    })
    .filter(match => match.matchScore > 0) // Only include non-zero scores
    .sort((a, b) => b.matchScore - a.matchScore);
  
  
  return matches.slice(0, 10); // Return top 10 matches
} 