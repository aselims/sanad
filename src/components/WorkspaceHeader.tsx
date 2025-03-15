import React, { useState } from 'react';
import { Plus, Filter, Lightbulb, Users, Rocket } from 'lucide-react';
import { NewCollaborationModal } from './NewCollaborationModal';
import { Collaboration } from '../types';
import ProtectedAction from './auth/ProtectedAction';
import { useAuth } from '../contexts/AuthContext';

interface WorkspaceHeaderProps {
  onCreateCollaboration: (collaboration: Partial<Collaboration>) => void;
  activeFilter?: 'all' | 'challenges' | 'partnerships' | 'ideas';
  onFilterChange?: (filter: 'all' | 'challenges' | 'partnerships' | 'ideas') => void;
}

export function WorkspaceHeader({ 
  onCreateCollaboration,
  activeFilter = 'all',
  onFilterChange
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

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Workspace</h1>
            <ProtectedAction 
              onAction={handleOpenModal}
              buttonClassName="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
              actionName="create a new collaboration"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Collaboration
            </ProtectedAction>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Collaboration Workspace</h1>
              <p className="text-gray-600 mt-1">Find and manage your collaborations</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                onClick={() => onCreateCollaboration({})}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Collaboration
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <button 
              onClick={() => handleFilterClick('all')}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                activeFilter === 'all' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-4 w-4 mr-1.5" />
              All
            </button>
            <button 
              onClick={() => handleFilterClick('challenges')}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                activeFilter === 'challenges' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              }`}
            >
              <Lightbulb className="h-4 w-4 mr-1.5" />
              Challenges
            </button>
            <button 
              onClick={() => handleFilterClick('partnerships')}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                activeFilter === 'partnerships' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
              }`}
            >
              <Users className="h-4 w-4 mr-1.5" />
              Partnerships
            </button>
            <button 
              onClick={() => handleFilterClick('ideas')}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                activeFilter === 'ideas' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              <Rocket className="h-4 w-4 mr-1.5" />
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