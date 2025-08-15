import { Request, Response } from 'express';
import { MatchService } from '../services/matchService';

export class MatchController {
  private matchService = new MatchService();

  async getPotentialMatches(req: Request, res: Response) {
    try {
      // Get the user ID from the authenticated user
      const userId = (req.user as any)?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const matches = await this.matchService.findPotentialMatches(userId);
      res.json({ data: matches });
    } catch (error) {
      console.error('Error fetching potential matches:', error);
      res.status(500).json({ error: 'Failed to fetch potential matches' });
    }
  }

  async saveMatchPreference(req: Request, res: Response) {
    try {
      // Get the user ID from the authenticated user
      const userId = (req.user as any)?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { targetUserId, preference } = req.body;

      if (!targetUserId || !preference) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const match = await this.matchService.saveMatchPreference(userId, targetUserId, preference);

      res.json({ data: match });
    } catch (error) {
      console.error('Error saving match preference:', error);
      res.status(500).json({ error: 'Failed to save match preference' });
    }
  }

  async getMatchHistory(req: Request, res: Response) {
    try {
      // Get the user ID from the authenticated user
      const userId = (req.user as any)?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const history = await this.matchService.getMatchHistory(userId);
      res.json({ data: history });
    } catch (error) {
      console.error('Error fetching match history:', error);
      res.status(500).json({ error: 'Failed to fetch match history' });
    }
  }
}
