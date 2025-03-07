import * as authService from '../auth';
import api from '../api';

// Mock the API module
jest.mock('../api', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Clear localStorage
    localStorage.clear();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      // Mock data
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'startup',
      };
      
      const mockResponse = {
        data: {
          status: 'success',
          message: 'User registered successfully',
          data: {
            user: {
              id: '123',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              role: 'startup',
              isVerified: false,
              isActive: true,
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
            token: 'mock-token',
          },
        },
      };
      
      // Mock the API response
      (api.post as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the register function
      const result = await authService.register(userData);
      
      // Assertions
      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse.data);
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.data.data.user));
    });
    
    it('should handle registration error', async () => {
      // Mock data
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      
      // Mock the API error
      const error = new Error('Registration failed');
      (api.post as jest.Mock).mockRejectedValue(error);
      
      // Call the register function and expect it to throw
      await expect(authService.register(userData)).rejects.toThrow();
      
      // Assertions
      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      // Mock data
      const loginData = {
        email: 'john@example.com',
        password: 'password123',
      };
      
      const mockResponse = {
        data: {
          status: 'success',
          message: 'Login successful',
          data: {
            user: {
              id: '123',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              role: 'startup',
              isVerified: true,
              isActive: true,
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
            token: 'mock-token',
          },
        },
      };
      
      // Mock the API response
      (api.post as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the login function
      const result = await authService.login(loginData);
      
      // Assertions
      expect(api.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(result).toEqual(mockResponse.data);
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.data.data.user));
    });
    
    it('should handle login error', async () => {
      // Mock data
      const loginData = {
        email: 'john@example.com',
        password: 'wrong-password',
      };
      
      // Mock the API error
      const error = new Error('Invalid credentials');
      (api.post as jest.Mock).mockRejectedValue(error);
      
      // Call the login function and expect it to throw
      await expect(authService.login(loginData)).rejects.toThrow();
      
      // Assertions
      expect(api.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear localStorage and redirect', () => {
      // Setup localStorage with mock data
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: '123' }));
      
      // Mock window.location.href
      const originalLocation = window.location;
      delete window.location;
      window.location = { ...originalLocation, href: '' };
      
      // Call the logout function
      authService.logout();
      
      // Assertions
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      
      // Restore window.location
      window.location = originalLocation;
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      // Setup localStorage with mock token
      localStorage.setItem('token', 'mock-token');
      
      // Call the isAuthenticated function
      const result = authService.isAuthenticated();
      
      // Assertions
      expect(result).toBe(true);
    });
    
    it('should return false when token does not exist', () => {
      // Ensure localStorage is empty
      localStorage.clear();
      
      // Call the isAuthenticated function
      const result = authService.isAuthenticated();
      
      // Assertions
      expect(result).toBe(false);
    });
  });

  describe('getUser', () => {
    it('should return user from localStorage', () => {
      // Mock user data
      const mockUser = {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };
      
      // Setup localStorage with mock user
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Call the getUser function
      const result = authService.getUser();
      
      // Assertions
      expect(result).toEqual(mockUser);
    });
    
    it('should return null when user does not exist in localStorage', () => {
      // Ensure localStorage is empty
      localStorage.clear();
      
      // Call the getUser function
      const result = authService.getUser();
      
      // Assertions
      expect(result).toBeNull();
    });
  });
}); 