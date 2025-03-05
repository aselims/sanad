import React from 'react';
import { Plus, MessageSquare, Users } from 'lucide-react';

export function WorkspaceHeader() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Workspace</h1>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              New Collaboration
            </button>
          </div>
          
          <div className="flex space-x-8">
            <button className="text-gray-900 flex items-center px-1 py-4 border-b-2 border-indigo-500">
              <Users className="h-5 w-5 mr-2" />
              <span>Active Collaborations</span>
            </button>
            <button className="text-gray-500 hover:text-gray-700 flex items-center px-1 py-4 border-b-2 border-transparent">
              <MessageSquare className="h-5 w-5 mr-2" />
              <span>Messages</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}