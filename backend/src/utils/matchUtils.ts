import { User } from '../entities/User';

export interface MatchResult {
  innovator: User;
  matchScore: number;
  sharedTags: string[];
  highlight: string;
}

// Helper function to convert array to readable string
function listToString(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, items.length - 1).join(', ');
  return `${otherItems}, and ${lastItem}`;
}

// Function to get user tags from user entity
function getUserTags(user: User): string[] {
  // Extract tags from user entity based on your data model
  // This is a placeholder - adjust based on your actual User entity structure
  return user.tags || user.interests || [];
}

// Function to generate highlight text based on match data
function generateMatchHighlight(
  currentUser: User,
  matchedUser: User,
  sharedTags: string[]
): string {
  // Different templates based on match type and shared attributes
  if (matchedUser.role === currentUser.role) {
    if (sharedTags.length > 0) {
      return `Both ${currentUser.role}s with shared interests in ${listToString(sharedTags)}.`;
    }
    return `Fellow ${currentUser.role} in ${matchedUser.organization || 'the industry'}.`;
  }

  if (sharedTags.length >= 3) {
    return `Strong match with ${matchedUser.firstName} across multiple areas: ${listToString(sharedTags)}.`;
  }

  if (matchedUser.location === currentUser.location) {
    if (sharedTags.length > 0) {
      return `Based in ${matchedUser.location} with shared interests in ${listToString(sharedTags)}.`;
    }
    return `Located in ${matchedUser.location} with complementary expertise.`;
  }

  if (sharedTags.length > 0) {
    return `${matchedUser.firstName} shares your passion for ${listToString(sharedTags)}.`;
  }

  return `${matchedUser.firstName} works in ${matchedUser.organization || 'the industry'} with complementary expertise.`;
}

// Main function to find potential matches
export function findPotentialMatches(currentUser: User, allUsers: User[]): MatchResult[] {
  return allUsers
    .filter(user => user.id !== currentUser.id)
    .map(user => {
      // Get tags for both users
      const currentUserTags = getUserTags(currentUser);
      const userTags = getUserTags(user);

      // Calculate shared tags
      const sharedTags = userTags.filter(tag => currentUserTags.includes(tag));

      // Calculate tag similarity score (50% weight)
      const tagSimilarity =
        sharedTags.length / Math.max(currentUserTags.length, userTags.length) || 0.1;

      // Calculate type compatibility score (30% weight)
      const typeScore = user.role === currentUser.role ? 1 : 0.5;

      // Calculate location proximity score (20% weight)
      const locationScore = user.location === currentUser.location ? 1 : 0.3;

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
        highlight,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5); // Return top 5 matches
}
