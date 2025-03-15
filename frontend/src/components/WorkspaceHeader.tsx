import React, { useState, useEffect } from 'react';
import { Plus, Filter, Lightbulb, Users, Rocket, Search, Grid, List, Bot, ToggleLeft, ToggleRight } from 'lucide-react';
import { NewCollaborationModal } from './NewCollaborationModal';
import { Collaboration } from '../types';
import ProtectedAction from './auth/ProtectedAction';
import { useAuth } from '../contexts/AuthContext';
import { performNormalSearch, performAISearch, SearchResults } from '../services/search';
import { useLocation, useNavigate } from 'react-router-dom';

interface WorkspaceHeaderProps {
  onCreateCollaboration: (collaboration: Partial<Collaboration>) => void;
  activeFilter?: 'all' | 'challenges' | 'partnerships' | 'ideas';
  onFilterChange?: (filter: 'all' | 'challenges' | 'partnerships' | 'ideas') => void;
  onSearch?: (query: string) => void;
  onSearchResults?: (results: SearchResults, query: string) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export function WorkspaceHeader({ 
  onCreateCollaboration,
  activeFilter = 'all',
  onFilterChange,
  onSearch,
  onSearchResults,
  viewMode = 'grid',
  onViewModeChange
}: WorkspaceHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAISearch, setIsAISearch] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Parse filter from URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const filterParam = searchParams.get('filter');
    
    if (filterParam && ['all', 'challenges', 'partnerships', 'ideas', 'innovators'].includes(filterParam)) {
      if (filterParam === 'innovators') {
        // Handle innovators filter differently if needed
      } else if (onFilterChange) {
        onFilterChange(filterParam as 'all' | 'challenges' | 'partnerships' | 'ideas');
      }
    }
  }, [location.search, onFilterChange]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateCollaboration = (collaboration: Partial<Collaboration>) => {
    if (onCreateCollaboration) {
      onCreateCollaboration(collaboration);
    }
    setIsModalOpen(false);
  };

  const handleFilterClick = (filter: 'all' | 'challenges' | 'partnerships' | 'ideas') => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
    
    // Update URL query parameter
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('filter', filter);
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      console.log(`Performing ${isAISearch ? 'AI' : 'normal'} search for: "${searchQuery}"`);
      
      // Use the appropriate search function based on the toggle state
      const results = isAISearch 
        ? await performAISearch(searchQuery)
        : await performNormalSearch(searchQuery);
      
      // If parent component provided a callback, call it with the results
      if (onSearchResults) {
        onSearchResults(results, searchQuery);
      }
      
      // Also call the simple onSearch callback if provided
      if (onSearch) {
        onSearch(searchQuery);
      }
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleViewMode = () => {
    if (onViewModeChange) {
      onViewModeChange(viewMode === 'grid' ? 'list' : 'grid');
    }
  };

  const toggleSearchMode = () => {
    setIsAISearch(!isAISearch);
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Collaboration Workspace</h1>
              <p className="text-gray-600 mt-1">Find and manage your collaborations</p>
            </div>
            <ProtectedAction 
              onAction={handleOpenModal}
              buttonClassName="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
              actionName="create a new collaboration"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Collaboration
            </ProtectedAction>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search Mode Toggle */}
            <button
              type="button"
              onClick={toggleSearchMode}
              className="flex items-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md px-4 py-2 transition-all duration-200"
            >
              {isAISearch ? (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">AI Chat Search</span>
                  <ToggleRight className="h-5 w-5 ml-2" />
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Normal Search</span>
                  <ToggleLeft className="h-5 w-5 ml-2" />
                </>
              )}
            </button>
            
            <form onSubmit={handleSearch} className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isAISearch ? <Bot className="h-5 w-5 text-gray-400" /> : <Search className="h-5 w-5 text-gray-400" />}
              </div>
              <input
                type="text"
                name="query"
                placeholder={isAISearch 
                  ? "Ask a question like 'Find healthcare innovators in Dubai'" 
                  : "Search for startups, research projects, funding, or collaboration opportunities..."}
                className="pl-10 pr-20 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute inset-y-0 right-0 px-4 text-white bg-indigo-600 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : isAISearch ? 'Ask AI' : 'Search'}
              </button>
            </form>
            
            <button
              onClick={toggleViewMode}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {viewMode === 'grid' ? (
                <>
                  <List className="h-5 w-5 mr-2" />
                  List View
                </>
              ) : (
                <>
                  <Grid className="h-5 w-5 mr-2" />
                  Grid View
                </>
              )}
            </button>
          </div>
          
          <div className="flex items-center border-b border-gray-200">
            <button
              onClick={() => handleFilterClick('all')}
              className={`px-4 py-2 text-sm font-medium ${
                activeFilter === 'all'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterClick('challenges')}
              className={`px-4 py-2 text-sm font-medium ${
                activeFilter === 'challenges'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Challenges
            </button>
            <button
              onClick={() => handleFilterClick('partnerships')}
              className={`px-4 py-2 text-sm font-medium ${
                activeFilter === 'partnerships'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Partnerships
            </button>
            <button
              onClick={() => handleFilterClick('ideas')}
              className={`px-4 py-2 text-sm font-medium ${
                activeFilter === 'ideas'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Ideas
            </button>
          </div>
        </div>
      </div>

      <NewCollaborationModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreateCollaboration={handleCreateCollaboration}
      />
    </div>
  );
}