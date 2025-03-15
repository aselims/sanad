import { searchCollaborations, getAllCollaborations } from '../collaborations';
import api from '../api';

// Mock the API module
jest.mock('../api', () => ({
  get: jest.fn(),
}));

// Mock the getAllCollaborations function for fallback testing
jest.mock('../collaborations', () => ({
  ...jest.requireActual('../collaborations'),
  getAllCollaborations: jest.fn(),
}));

describe('Collaborations Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('searchCollaborations', () => {
    it('should search collaborations successfully', async () => {
      // Mock data
      const query = 'health';
      const mockCollaborations = [
        {
          id: '1',
          title: 'Health Tech Innovation',
          description: 'A collaboration focused on health technology',
          participants: ['Hospital A', 'Tech Company B'],
          status: 'proposed',
          type: 'challenge',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          title: 'Mental Health Platform',
          description: 'Building a platform for mental health support',
          participants: ['Clinic C', 'Startup D'],
          status: 'active',
          type: 'partnership',
          createdAt: '2023-02-01T00:00:00.000Z',
          updatedAt: '2023-02-01T00:00:00.000Z',
        },
      ];
      
      const mockResponse = {
        data: {
          status: 'success',
          data: mockCollaborations,
        },
      };
      
      // Mock the API response
      (api.get as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the searchCollaborations function
      const result = await searchCollaborations(query);
      
      // Assertions
      expect(api.get).toHaveBeenCalledWith(`/collaborations/search?q=${encodeURIComponent(query)}`);
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Health Tech Innovation');
      expect(result[1].title).toBe('Mental Health Platform');
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[1].updatedAt).toBeInstanceOf(Date);
    });
    
    it('should handle API error and fall back to client-side search', async () => {
      // Mock data
      const query = 'health';
      const mockCollaborations = [
        {
          id: '1',
          title: 'Health Tech Innovation',
          description: 'A collaboration focused on health technology',
          participants: ['Hospital A', 'Tech Company B'],
          status: 'proposed',
          type: 'challenge',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
      ];
      
      // Mock the API error
      const error = new Error('API error');
      (api.get as jest.Mock).mockRejectedValue(error);
      
      // Mock the getAllCollaborations function for fallback
      (getAllCollaborations as jest.Mock).mockResolvedValue(mockCollaborations);
      
      // Call the searchCollaborations function
      const result = await searchCollaborations(query);
      
      // Assertions
      expect(api.get).toHaveBeenCalledWith(`/collaborations/search?q=${encodeURIComponent(query)}`);
      expect(getAllCollaborations).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Health Tech Innovation');
    });
    
    it('should handle both API and fallback errors', async () => {
      // Mock data
      const query = 'health';
      
      // Mock the API error
      const apiError = new Error('API error');
      (api.get as jest.Mock).mockRejectedValue(apiError);
      
      // Mock the getAllCollaborations error
      const fallbackError = new Error('Fallback error');
      (getAllCollaborations as jest.Mock).mockRejectedValue(fallbackError);
      
      // Call the searchCollaborations function
      const result = await searchCollaborations(query);
      
      // Assertions
      expect(api.get).toHaveBeenCalledWith(`/collaborations/search?q=${encodeURIComponent(query)}`);
      expect(getAllCollaborations).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
}); 