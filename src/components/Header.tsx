import React from 'react';
import { Menu, Bell, UserCircle } from 'lucide-react';

interface HeaderProps {
  onNavigateToWorkspace?: () => void;
  onNavigateToChallenges?: () => void;
  onNavigateToPartnerships?: () => void;
  onNavigateToInnovators?: () => void;
  onBackToHome?: () => void;
}

export function Header({ 
  onNavigateToWorkspace,
  onNavigateToChallenges,
  onNavigateToPartnerships,
  onNavigateToInnovators,
  onBackToHome
}: HeaderProps) {
  // Create handler functions that check if the callbacks exist before calling them
  const handleChallengesClick = () => {
    console.log("Challenges clicked");
    if (onNavigateToChallenges) {
      onNavigateToChallenges();
    }
  };

  const handlePartnershipsClick = () => {
    console.log("Partnerships clicked");
    if (onNavigateToPartnerships) {
      onNavigateToPartnerships();
    }
  };

  const handleInnovatorsClick = () => {
    console.log("Innovators clicked");
    if (onNavigateToInnovators) {
      onNavigateToInnovators();
    }
  };

  const handleHomeClick = () => {
    console.log("Home clicked");
    if (onBackToHome) {
      onBackToHome();
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={handleHomeClick} 
              className="text-2xl font-bold text-indigo-600 focus:outline-none cursor-pointer"
            >
              SANAD
            </button>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={handleChallengesClick}
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium focus:outline-none cursor-pointer"
            >
              Challenges
            </button>
            <button 
              onClick={handlePartnershipsClick}
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium focus:outline-none cursor-pointer"
            >
              Partnerships
            </button>
            <button 
              onClick={handleInnovatorsClick}
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium focus:outline-none cursor-pointer"
            >
              Innovators
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-indigo-600 focus:outline-none cursor-pointer">
              <Bell className="h-6 w-6" />
            </button>
            <button className="text-gray-500 hover:text-indigo-600 focus:outline-none cursor-pointer">
              <UserCircle className="h-6 w-6" />
            </button>
            <button className="md:hidden text-gray-500 hover:text-indigo-600 focus:outline-none cursor-pointer">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}