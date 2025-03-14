import { Not, FindOneOptions } from 'typeorm';
import { Match } from '../entities/Match';
import { User } from '../entities/User';
import { findPotentialMatches, MatchResult } from '../utils/matchUtils';
import { AppDataSource } from '../config/data-source';
import { v4 as uuidv4 } from 'uuid';

export class MatchService {
  private matchRepository = AppDataSource.getRepository(Match);
  private userRepository = AppDataSource.getRepository(User);

  async findPotentialMatches(userId: string): Promise<Match[]> {
    // Get current user
    const options: FindOneOptions<User> = { where: { id: userId } };
    const currentUser = await this.userRepository.findOne(options);
    if (!currentUser) {
      throw new Error('User not found');
    }

    // Get all other users
    const allUsers = await this.userRepository.find({
      where: { id: Not(userId) }
    });

    // Get existing matches for this user
    const existingMatches = await this.matchRepository.find({
      where: { userId }
    });

    // Create a map of existing matches by targetUserId for quick lookup
    const existingMatchesMap = new Map<string, Match>();
    existingMatches.forEach(match => {
      existingMatchesMap.set(match.targetUserId, match);
    });

    // Use the matching algorithm to find potential matches
    const matches = findPotentialMatches(currentUser, allUsers);

    // Save matches to database
    const savedMatches = await Promise.all(
      matches.map(async (match: MatchResult) => {
        // Check if we already have this match in our map
        const existingMatch = existingMatchesMap.get(match.innovator.id);

        if (existingMatch) {
          // Update match score and other attributes if needed
          existingMatch.matchScore = match.matchScore;
          existingMatch.sharedTags = match.sharedTags;
          existingMatch.highlight = match.highlight;
          return this.matchRepository.save(existingMatch);
        }

        // Create a new match
        const newMatch = this.matchRepository.create({
          id: uuidv4(), // Explicitly generate UUID
          userId,
          targetUserId: match.innovator.id,
          matchScore: match.matchScore,
          sharedTags: match.sharedTags,
          highlight: match.highlight
        });

        return this.matchRepository.save(newMatch);
      })
    );

    // Also include any previously saved matches that might not be in the current top matches
    // This ensures we don't lose liked/disliked preferences
    const additionalMatches = existingMatches.filter(
      existingMatch => !savedMatches.some(
        (savedMatch: Match) => savedMatch.targetUserId === existingMatch.targetUserId
      )
    );

    return [...savedMatches, ...additionalMatches];
  }

  async saveMatchPreference(
    userId: string,
    targetUserId: string,
    preference: 'like' | 'dislike'
  ): Promise<Match> {
    let match = await this.matchRepository.findOne({
      where: {
        userId,
        targetUserId
      }
    });

    if (!match) {
      // Create a new match if it doesn't exist
      const currentUser = await this.userRepository.findOne({ 
        where: { id: userId } 
      });
      
      const targetUser = await this.userRepository.findOne({ 
        where: { id: targetUserId } 
      });
      
      if (!currentUser || !targetUser) {
        throw new Error('User not found');
      }
      
      // Create a basic match with default values and explicit ID
      match = this.matchRepository.create({
        id: uuidv4(), // Explicitly generate UUID
        userId,
        targetUserId,
        matchScore: 50, // Default score
        sharedTags: [],
        highlight: "You showed interest in this profile"
      });
    }

    match.preference = preference;
    return this.matchRepository.save(match);
  }

  async getMatchHistory(userId: string): Promise<Match[]> {
    return this.matchRepository.find({
      where: { userId },
      relations: ['targetUser'],
      order: { createdAt: 'DESC' }
    });
  }
} 