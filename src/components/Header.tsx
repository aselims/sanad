import React from 'react';
import { Menu, Bell, UserCircle } from 'lucide-react';

interface HeaderProps {
  onNavigateToWorkspace?: () => void;
}

export function Header({ onNavigateToWorkspace }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={onNavigateToWorkspace} 
              className="text-2xl font-bold text-indigo-600 focus:outline-none"
            >
              SANAD
            </button>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={onNavigateToWorkspace}
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium focus:outline-none"
            >
              Challenges
            </button>
            <button 
              onClick={onNavigateToWorkspace}
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium focus:outline-none"
            >
              Partnerships
            </button>
            <button 
              onClick={onNavigateToWorkspace}
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium focus:outline-none"
            >
              Research
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-indigo-600 focus:outline-none">
              <Bell className="h-6 w-6" />
            </button>
            <button className="text-gray-500 hover:text-indigo-600 focus:outline-none">
              <UserCircle className="h-6 w-6" />
            </button>
            <button className="md:hidden text-gray-500 hover:text-indigo-600 focus:outline-none">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}