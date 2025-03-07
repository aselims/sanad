import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { NewCollaborationModal } from './NewCollaborationModal';
import { Collaboration } from '../types';
import ProtectedAction from './auth/ProtectedAction';
import { useAuth } from '../contexts/AuthContext';

interface WorkspaceHeaderProps {
  onCreateCollaboration?: (collaboration: Partial<Collaboration>) => void;
}

export function WorkspaceHeader({ onCreateCollaboration }: WorkspaceHeaderProps) {
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
          
          {/* Removed the tab navigation as requested */}
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