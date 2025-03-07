import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, UserCircle, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onNavigateToWorkspace?: () => void;
  onNavigateToChallenges?: () => void;
  onNavigateToPartnerships?: () => void;
  onNavigateToInnovators?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToAuth?: () => void;
}

export function Header({ 
  onNavigateToWorkspace,
  onNavigateToChallenges,
  onNavigateToPartnerships,
  onNavigateToInnovators,
  onNavigateToHome,
  onNavigateToProfile,
  onNavigateToAuth
}: HeaderProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  const handleLogoClick = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
    setShowUserMenu(false);
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  const handleAuthClick = () => {
    console.log("Auth clicked");
    if (onNavigateToAuth) {
      onNavigateToAuth();
    }
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    setShowUserMenu(false);
    logout();
  };

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

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={handleLogoClick} 
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
            {isAuthenticated ? (
              <>
                <button className="text-gray-500 hover:text-indigo-600 focus:outline-none cursor-pointer">
                  <Bell className="h-6 w-6" />
                </button>
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="text-gray-500 hover:text-indigo-600 focus:outline-none cursor-pointer flex items-center"
                  >
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={`${user.firstName} ${user.lastName}`} 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-6 w-6" />
                    )}
                    <span className="ml-2 text-sm font-medium hidden md:block">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.email?.split('@')[0] || 'User'}
                    </span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <button
                        onClick={handleProfileClick}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <UserCircle className="h-4 w-4 mr-2" />
                          <span>Your Profile</span>
                        </div>
                      </button>
                      <button
                        onClick={() => {}}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          <span>Settings</span>
                        </div>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          <span>Sign out</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={handleAuthClick}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login / Register
              </button>
            )}
            <button className="md:hidden text-gray-500 hover:text-indigo-600 focus:outline-none cursor-pointer">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}