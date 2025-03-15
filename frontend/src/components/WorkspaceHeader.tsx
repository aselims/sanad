import React, { useState } from 'react';
import { Plus, Filter, Lightbulb, Users, Rocket, Search, Grid, List } from 'lucide-react';
import { NewCollaborationModal } from './NewCollaborationModal';
import { Collaboration } from '../types';
import ProtectedAction from './auth/ProtectedAction';
import { useAuth } from '../contexts/AuthContext';

interface WorkspaceHeaderProps {
  onCreateCollaboration: (collaboration: Partial<Collaboration>) => void;
  activeFilter?: 'all' | 'challenges' | 'partnerships' | 'ideas';
  onFilterChange?: (filter: 'all' | 'challenges' | 'partnerships' | 'ideas') => void;
  onSearch?: (query: string) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export function WorkspaceHeader({ 
  onCreateCollaboration,
  activeFilter = 'all',
  onFilterChange,
  onSearch,
  viewMode = 'grid',
  onViewModeChange
}: WorkspaceHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

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
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('query') as string;
    
    if (onSearch) {
      onSearch(query);
    }
  };

  const toggleViewMode = () => {
    if (onViewModeChange) {
      onViewModeChange(viewMode === 'grid' ? 'list' : 'grid');
    }
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
            <form onSubmit={handleSearch} className="relative flex-grow">
              <input
                type="text"
                name="query"
                placeholder="Search collaborations..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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