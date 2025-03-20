import React, { useState, useEffect, useRef } from 'react';
import { Plus, Filter, Lightbulb, Users, Rocket, Search, Grid, List, Briefcase, Handshake, Bell, UserCircle, LogOut, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { NewCollaborationModal } from './NewCollaborationModal';
import { Collaboration } from '../types';
import ProtectedAction from './auth/ProtectedAction';
import { useAuth } from '../contexts/AuthContext';
import { SearchResults } from '../services/search';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { SearchComponent } from './SearchComponent';

interface WorkspaceHeaderProps {
  onCreateCollaboration: (collaboration: Partial<Collaboration>) => void;
  activeFilter?: 'all' | 'challenges' | 'partnerships' | 'ideas';
  onFilterChange?: (filter: 'all' | 'challenges' | 'partnerships' | 'ideas') => void;
  onSearch?: (query: string) => void;
  onSearchResults?: (results: SearchResults, query: string) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onNavigateToHome?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToAuth?: () => void;
}

export function WorkspaceHeader({ 
  onCreateCollaboration,
  activeFilter = 'all',
  onFilterChange,
  onSearch,
  onSearchResults,
  viewMode = 'grid',
  onViewModeChange,
  onNavigateToHome,
  onNavigateToProfile,
  onNavigateToAuth
}: WorkspaceHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const toggleViewMode = () => {
    if (onViewModeChange) {
      onViewModeChange(viewMode === 'grid' ? 'list' : 'grid');
    }
  };

  // Add search handlers
  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
  };

  const handleSearchResults = (results: SearchResults, query: string) => {
    if (onSearchResults) {
      onSearchResults(results, query);
    }
    navigate('/?search=' + encodeURIComponent(query));
  };

  const handleLogout = () => {
    logout();
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  const renderUserMenu = () => {
    return (
      <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <button
          onClick={onNavigateToProfile}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Profile
        </button>
        <button
          onClick={() => navigate('/profile/' + user?.id + '?tab=connections')}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Connections
        </button>
        <button
          onClick={() => navigate('/messages')}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Messages
        </button>
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Collaboration Workspace</h1>
                <p className="text-gray-600 mt-1">Find and manage your collaborations</p>
              </div>
               <div className="flex items-center space-x-3">
                <ProtectedAction 
                  onAction={handleOpenModal}
                  buttonClassName="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                  actionName="create a new collaboration"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Collaboration
                </ProtectedAction>
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
      </div>

      <NewCollaborationModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreateCollaboration={handleCreateCollaboration}
      />

      {/* Add SearchComponent */}
      <SearchComponent 
        isOpen={isSearchOpen}
        onClose={handleSearchClose}
        onSearchResults={handleSearchResults}
      />
    </>
  );
}