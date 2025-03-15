import React, { useState, useEffect } from 'react';
import { Plus, Filter, Lightbulb, Users, Rocket, Search, Grid, List, Bot, ToggleLeft, ToggleRight, Briefcase, Handshake } from 'lucide-react';
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
          <div className="flex justify-between items-center mb-6">
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
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <button
                className={`flex items-center px-4 py-2 rounded-md ${
                  isAISearch ? 'bg-gray-100 text-gray-700' : 'bg-indigo-100 text-indigo-700'
                } hover:bg-gray-200`}
                onClick={toggleSearchMode}
              >
                {isAISearch ? (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    AI Search
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Normal Search
                  </>
                )}
                {isAISearch ? <ToggleRight className="h-5 w-5 ml-2" /> : <ToggleLeft className="h-5 w-5 ml-2" />}
              </button>
            </div>
            
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isAISearch ? <Bot className="h-5 w-5 text-gray-400" /> : <Search className="h-5 w-5 text-gray-400" />}
              </div>
              <input
                type="text"
                placeholder={isAISearch 
                  ? "Ask a question like 'Find healthcare innovators in Dubai'" 
                  : "Search for startups, research projects, funding, or collaboration opportunities..."}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e as unknown as React.FormEvent<HTMLFormElement>);
                  }
                }}
              />
              <button
                className="absolute inset-y-0 right-0 px-4 text-white bg-indigo-600 rounded-r-md hover:bg-indigo-700 focus:outline-none"
                onClick={(e) => handleSearch(e as unknown as React.FormEvent<HTMLFormElement>)}
              >
                {isSearching ? 'Searching...' : isAISearch ? 'Ask AI' : 'Search'}
              </button>
            </div>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex justify-between">
              <div className="flex space-x-8">
                <button
                  className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${
                    activeFilter === 'all'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleFilterClick('all')}
                >
                  <Grid className="h-4 w-4 mr-2" />
                  All
                </button>
                <button
                  className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${
                    activeFilter === 'challenges'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleFilterClick('challenges')}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Challenges
                </button>
                <button
                  className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${
                    activeFilter === 'partnerships'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleFilterClick('partnerships')}
                >
                  <Handshake className="h-4 w-4 mr-2" />
                  Partnerships
                </button>
                <button
                  className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${
                    activeFilter === 'ideas'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleFilterClick('ideas')}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Ideas
                </button>
              </div>
              
              <button
                onClick={toggleViewMode}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 focus:outline-none"
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
            </nav>
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