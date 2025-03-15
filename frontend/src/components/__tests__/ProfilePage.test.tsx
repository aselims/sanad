import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfilePage } from '../ProfilePage';
import { useAuth } from '../../contexts/AuthContext';
import { connectWithUser } from '../../services/users';

// Mock the auth context
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the users service
jest.mock('../../services/users', () => ({
  connectWithUser: jest.fn(),
  sendMessageToUser: jest.fn(),
  updateCurrentUserProfile: jest.fn(),
}));

// Mock the ProtectedAction component
jest.mock('../auth/ProtectedAction', () => ({
  __esModule: true,
  default: ({ children, onAction, buttonClassName }) => (
    <button onClick={onAction} className={buttonClassName}>
      {children}
    </button>
  ),
}));

describe('ProfilePage Component', () => {
  // Mock user data
  const mockUser = {
    id: '123',
    name: 'John Doe',
    type: 'startup',
    organization: 'Tech Startup',
    description: 'A tech startup',
    expertise: ['Technology', 'Innovation'],
    tags: ['Tech', 'Innovation'],
  };
  
  // Mock potential matches
  const mockPotentialMatches = [
    {
      id: '456',
      name: 'Jane Smith',
      type: 'investor',
      organization: 'Investment Firm',
      description: 'An investment firm',
      expertise: ['Finance', 'Investment'],
      tags: ['Finance', 'Investment'],
    },
  ];
  
  // Mock match requests
  const mockMatchRequests = [
    {
      innovator: {
        id: '789',
        name: 'Bob Johnson',
        type: 'research',
        organization: 'Research Lab',
        description: 'A research lab',
        expertise: ['Research', 'Science'],
        tags: ['Research', 'Science'],
      },
      challenge: {
        id: '101',
        title: 'Research Challenge',
        description: 'A research challenge',
        participants: ['Research Lab'],
        status: 'proposed',
        type: 'challenge',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      message: 'Interested in your challenge',
      date: '2023-01-01',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Privacy of Potential Matches and Match Requests', () => {
    it('should not show potential matches and match requests tabs for non-authenticated users', () => {
      // Mock the auth context to return non-authenticated user
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });
      
      render(
        <ProfilePage
          user={mockUser}
          potentialMatches={mockPotentialMatches}
          matchRequests={mockMatchRequests}
        />
      );
      
      // Check if the profile tab is visible
      expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
      
      // Check if the potential matches tab is not visible
      expect(screen.queryByRole('button', { name: /potential matches/i })).not.toBeInTheDocument();
      
      // Check if the match requests tab is not visible
      expect(screen.queryByRole('button', { name: /match requests/i })).not.toBeInTheDocument();
    });
    
    it('should not show potential matches and match requests tabs when viewing another user\'s profile', () => {
      // Mock the auth context to return authenticated user with different ID
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '999', // Different from mockUser.id
          firstName: 'Current',
          lastName: 'User',
        },
      });
      
      render(
        <ProfilePage
          user={mockUser}
          potentialMatches={mockPotentialMatches}
          matchRequests={mockMatchRequests}
        />
      );
      
      // Check if the profile tab is visible
      expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
      
      // Check if the potential matches tab is not visible
      expect(screen.queryByRole('button', { name: /potential matches/i })).not.toBeInTheDocument();
      
      // Check if the match requests tab is not visible
      expect(screen.queryByRole('button', { name: /match requests/i })).not.toBeInTheDocument();
    });
    
    it('should show potential matches and match requests tabs for authenticated users viewing their own profile', () => {
      // Mock the auth context to return authenticated user with same ID as mockUser
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '123', // Same as mockUser.id
          firstName: 'John',
          lastName: 'Doe',
        },
      });
      
      render(
        <ProfilePage
          user={mockUser}
          potentialMatches={mockPotentialMatches}
          matchRequests={mockMatchRequests}
        />
      );
      
      // Check if the profile tab is visible
      expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
      
      // Check if the potential matches tab is visible
      expect(screen.getByRole('button', { name: /potential matches/i })).toBeInTheDocument();
      
      // Check if the match requests tab is visible
      expect(screen.getByRole('button', { name: /match requests/i })).toBeInTheDocument();
    });
  });

  describe('Connect Button Notification', () => {
    it('should show a notification when connect button is clicked', async () => {
      // Mock the auth context to return authenticated user with different ID
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '999', // Different from mockUser.id
          firstName: 'Current',
          lastName: 'User',
        },
      });
      
      // Mock the connectWithUser function to resolve successfully
      (connectWithUser as jest.Mock).mockResolvedValue({ success: true });
      
      render(
        <ProfilePage
          user={mockUser}
          potentialMatches={mockPotentialMatches}
          matchRequests={mockMatchRequests}
        />
      );
      
      // Check if the connect button is visible
      const connectButton = screen.getByRole('button', { name: /connect/i });
      expect(connectButton).toBeInTheDocument();
      
      // Click the connect button
      fireEvent.click(connectButton);
      
      // Wait for the connectWithUser function to be called
      await waitFor(() => {
        expect(connectWithUser).toHaveBeenCalledWith(mockUser.id);
      });
      
      // Check if the success notification is displayed
      await waitFor(() => {
        expect(screen.getByText(/connection request sent to/i)).toBeInTheDocument();
      });
    });
    
    it('should show an error notification when connect button fails', async () => {
      // Mock the auth context to return authenticated user with different ID
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '999', // Different from mockUser.id
          firstName: 'Current',
          lastName: 'User',
        },
      });
      
      // Mock the connectWithUser function to reject with an error
      (connectWithUser as jest.Mock).mockRejectedValue(new Error('Connection failed'));
      
      render(
        <ProfilePage
          user={mockUser}
          potentialMatches={mockPotentialMatches}
          matchRequests={mockMatchRequests}
        />
      );
      
      // Check if the connect button is visible
      const connectButton = screen.getByRole('button', { name: /connect/i });
      expect(connectButton).toBeInTheDocument();
      
      // Click the connect button
      fireEvent.click(connectButton);
      
      // Wait for the connectWithUser function to be called
      await waitFor(() => {
        expect(connectWithUser).toHaveBeenCalledWith(mockUser.id);
      });
      
      // Check if the error notification is displayed
      await waitFor(() => {
        expect(screen.getByText(/failed to send connection request/i)).toBeInTheDocument();
      });
    });
  });
}); 