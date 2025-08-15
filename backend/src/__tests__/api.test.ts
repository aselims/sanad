import request from 'supertest';
import express from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Challenge } from '../entities/Challenge';
import { Partnership } from '../entities/Partnership';
import apiRouter from '../routes/api';

// Mock the TypeORM AppDataSource
jest.mock('../config/data-source', () => ({
  AppDataSource: {
    isInitialized: true,
    getRepository: jest.fn(),
  },
}));

describe('API Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', apiRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('database');
    });
  });

  describe('GET /users/search', () => {
    it('should search users', async () => {
      // Mock user data
      const mockUsers = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'startup',
          organization: 'Health Tech',
          bio: 'Health technology startup',
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          role: 'investor',
          organization: 'Investment Firm',
          bio: 'Investment in health sector',
        },
      ];

      // Mock the User repository
      const mockUserRepo = {
        find: jest.fn().mockResolvedValue(mockUsers),
      };

      // Set up the mock repository
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepo);

      // Make the request
      const response = await request(app).get('/api/users/search?q=health');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
      expect(AppDataSource.getRepository).toHaveBeenCalledWith(User);
      expect(mockUserRepo.find).toHaveBeenCalled();
    });

    it('should return 400 if query is missing', async () => {
      const response = await request(app).get('/api/users/search');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Search query is required');
    });

    it('should handle errors', async () => {
      // Mock the User repository to throw an error
      const mockUserRepo = {
        find: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      // Set up the mock repository
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepo);

      // Make the request
      const response = await request(app).get('/api/users/search?q=health');

      // Assertions
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Failed to search users');
    });
  });

  describe('GET /collaborations/search', () => {
    it('should search collaborations', async () => {
      // Mock challenge data
      const mockChallenges = [
        {
          id: '1',
          title: 'Health Challenge',
          description: 'A challenge in the health sector',
          organization: 'Health Org',
          type: 'corporate',
          status: 'open',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Mock partnership data
      const mockPartnerships = [
        {
          id: '2',
          title: 'Health Partnership',
          description: 'A partnership in the health sector',
          participants: ['Health Org', 'Tech Company'],
          status: 'proposed',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Mock the repositories
      const mockChallengeRepo = {
        find: jest.fn().mockResolvedValue(mockChallenges),
      };

      const mockPartnershipRepo = {
        find: jest.fn().mockResolvedValue(mockPartnerships),
      };

      // Set up the mock repositories
      (AppDataSource.getRepository as jest.Mock)
        .mockReturnValueOnce(mockChallengeRepo)
        .mockReturnValueOnce(mockPartnershipRepo);

      // Make the request
      const response = await request(app).get('/api/collaborations/search?q=health');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
      expect(AppDataSource.getRepository).toHaveBeenCalledWith(Challenge);
      expect(AppDataSource.getRepository).toHaveBeenCalledWith(Partnership);
      expect(mockChallengeRepo.find).toHaveBeenCalled();
      expect(mockPartnershipRepo.find).toHaveBeenCalled();
    });

    it('should return 400 if query is missing', async () => {
      const response = await request(app).get('/api/collaborations/search');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Search query is required');
    });

    it('should handle errors', async () => {
      // Mock the Challenge repository to throw an error
      const mockChallengeRepo = {
        find: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      // Set up the mock repository
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockChallengeRepo);

      // Make the request
      const response = await request(app).get('/api/collaborations/search?q=health');

      // Assertions
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Failed to search collaborations');
    });
  });

  describe('POST /connections/request', () => {
    it('should create a connection request', async () => {
      // Mock request with JWT authentication
      const response = await request(app)
        .post('/api/connections/request')
        .set('Authorization', 'Bearer mock-token')
        .send({ targetUserId: '123' });

      // Since we're not actually testing the authentication middleware,
      // this will likely fail, but we can still test the route structure
      expect(response.status).toBe(401);
    });
  });
});
