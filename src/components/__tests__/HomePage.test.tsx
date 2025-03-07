import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomePage } from '../HomePage';
import { searchInnovators } from '../../services/innovators';
import { searchCollaborations } from '../../services/collaborations';

// Mock the services
jest.mock('../../services/innovators', () => ({
  searchInnovators: jest.fn(),
}));

jest.mock('../../services/collaborations', () => ({
  searchCollaborations: jest.fn(),
}));

describe('HomePage Component', () => {
  // Mock props
  const mockProps = {
    onNavigateToWorkspace: jest.fn(),
    onNavigateToCollaboration: jest.fn(),
    onNavigateToChallenges: jest.fn(),
    onNavigateToPartnerships: jest.fn(),
    onNavigateToInnovators: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search form', () => {
    render(<HomePage {...mockProps} />);
    
    // Check if the search input is rendered
    const searchInput = screen.getByPlaceholderText(/search for startups/i);
    expect(searchInput).toBeInTheDocument();
    
    // Check if the search button is rendered
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeInTheDocument();
  });

  it('handles search input change', async () => {
    render(<HomePage {...mockProps} />);
    
    // Get the search input
    const searchInput = screen.getByPlaceholderText(/search for startups/i);
    
    // Type in the search input
    await userEvent.type(searchInput, 'health');
    
    // Check if the input value is updated
    expect(searchInput).toHaveValue('health');
  });

  it('performs search and displays results', async () => {
    // Mock search results
    const mockInnovators = [
      {
        id: '1',
        name: 'Health Tech Startup',
        type: 'startup',
        organization: 'Health Inc',
        description: 'A health tech startup',
        expertise: ['Health', 'Technology'],
        tags: ['Health', 'Tech'],
      },
    ];
    
    const mockCollaborations = [
      {
        id: '2',
        title: 'Health Innovation Challenge',
        description: 'A challenge for health innovation',
        participants: ['Hospital A', 'Tech Company B'],
        status: 'proposed',
        type: 'challenge',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    // Setup mocks
    (searchInnovators as jest.Mock).mockResolvedValue(mockInnovators);
    (searchCollaborations as jest.Mock).mockResolvedValue(mockCollaborations);
    
    render(<HomePage {...mockProps} />);
    
    // Get the search input and button
    const searchInput = screen.getByPlaceholderText(/search for startups/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    // Type in the search input
    await userEvent.type(searchInput, 'health');
    
    // Click the search button
    fireEvent.click(searchButton);
    
    // Wait for the search results to be displayed
    await waitFor(() => {
      expect(searchInnovators).toHaveBeenCalledWith('health');
      expect(searchCollaborations).toHaveBeenCalledWith('health');
    });
    
    // Check if the search results are displayed
    await waitFor(() => {
      expect(screen.getByText('Health Tech Startup')).toBeInTheDocument();
      expect(screen.getByText('Health Innovation Challenge')).toBeInTheDocument();
    });
  });

  it('handles search with no results', async () => {
    // Setup mocks to return empty arrays
    (searchInnovators as jest.Mock).mockResolvedValue([]);
    (searchCollaborations as jest.Mock).mockResolvedValue([]);
    
    render(<HomePage {...mockProps} />);
    
    // Get the search input and button
    const searchInput = screen.getByPlaceholderText(/search for startups/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    // Type in the search input
    await userEvent.type(searchInput, 'nonexistent');
    
    // Click the search button
    fireEvent.click(searchButton);
    
    // Wait for the search to complete
    await waitFor(() => {
      expect(searchInnovators).toHaveBeenCalledWith('nonexistent');
      expect(searchCollaborations).toHaveBeenCalledWith('nonexistent');
    });
    
    // Check if the "no results" message is displayed
    await waitFor(() => {
      expect(screen.getByText(/no results found for/i)).toBeInTheDocument();
    });
  });

  it('handles search error', async () => {
    // Setup mocks to throw errors
    (searchInnovators as jest.Mock).mockRejectedValue(new Error('API error'));
    (searchCollaborations as jest.Mock).mockRejectedValue(new Error('API error'));
    
    render(<HomePage {...mockProps} />);
    
    // Get the search input and button
    const searchInput = screen.getByPlaceholderText(/search for startups/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    // Type in the search input
    await userEvent.type(searchInput, 'error');
    
    // Click the search button
    fireEvent.click(searchButton);
    
    // Wait for the search to complete
    await waitFor(() => {
      expect(searchInnovators).toHaveBeenCalledWith('error');
      expect(searchCollaborations).toHaveBeenCalledWith('error');
    });
    
    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/an error occurred while searching/i)).toBeInTheDocument();
    });
  });

  it('clears search results when clicking the clear button', async () => {
    // Mock search results
    const mockInnovators = [
      {
        id: '1',
        name: 'Health Tech Startup',
        type: 'startup',
        organization: 'Health Inc',
        description: 'A health tech startup',
        expertise: ['Health', 'Technology'],
        tags: ['Health', 'Tech'],
      },
    ];
    
    // Setup mocks
    (searchInnovators as jest.Mock).mockResolvedValue(mockInnovators);
    (searchCollaborations as jest.Mock).mockResolvedValue([]);
    
    render(<HomePage {...mockProps} />);
    
    // Get the search input and button
    const searchInput = screen.getByPlaceholderText(/search for startups/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    // Type in the search input
    await userEvent.type(searchInput, 'health');
    
    // Click the search button
    fireEvent.click(searchButton);
    
    // Wait for the search results to be displayed
    await waitFor(() => {
      expect(screen.getByText('Health Tech Startup')).toBeInTheDocument();
    });
    
    // Click the clear button
    const clearButton = screen.getByRole('button', { name: /clear results/i });
    fireEvent.click(clearButton);
    
    // Check if the search results are cleared
    await waitFor(() => {
      expect(screen.queryByText('Health Tech Startup')).not.toBeInTheDocument();
      expect(searchInput).toHaveValue('');
    });
  });
}); 