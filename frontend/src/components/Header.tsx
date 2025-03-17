import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, UserCircle, LogOut, Settings, X, Users, MessageSquare, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onNavigateToWorkspace?: () => void;
  onNavigateToChallenges?: () => void;
  onNavigateToPartnerships?: () => void;
  onNavigateToIdeas?: () => void;
  onNavigateToInnovators?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToAuth?: () => void;
  onNavigateToHowItWorks?: () => void;
  onNavigateToSuccessStories?: () => void;
  onNavigateToFAQ?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToContactUs?: () => void;
  onNavigateToLegalPage?: (page: 'terms' | 'privacy' | 'cookies') => void;
  onNavigateToConnections?: () => void;
  onNavigateToCollaborations?: () => void;
  onNavigateToMessages?: () => void;
  isAuthenticated?: boolean;
}

export function Header({ 
  onNavigateToWorkspace,
  onNavigateToChallenges,
  onNavigateToPartnerships,
  onNavigateToIdeas,
  onNavigateToInnovators,
  onNavigateToHome,
  onNavigateToProfile,
  onNavigateToAuth,
  onNavigateToHowItWorks,
  onNavigateToSuccessStories,
  onNavigateToFAQ,
  onNavigateToSupport,
  onNavigateToContactUs,
  onNavigateToLegalPage,
  onNavigateToConnections,
  onNavigateToCollaborations,
  onNavigateToMessages,
  isAuthenticated: propIsAuthenticated
}: HeaderProps) {
  const { isAuthenticated: authIsAuthenticated, user, logout } = useAuth();
  const isAuthenticated = propIsAuthenticated !== undefined ? propIsAuthenticated : authIsAuthenticated;
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  const handleIdeasClick = () => {
    console.log("Ideas clicked");
    if (onNavigateToIdeas) {
      onNavigateToIdeas();
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

  const handleConnectionsClick = () => {
    if (onNavigateToConnections) {
      onNavigateToConnections();
    } else {
      navigate('/connections');
    }
    setShowUserMenu(false);
  };

  const handleMessagesClick = () => {
    if (onNavigateToMessages) {
      onNavigateToMessages();
    } else {
      navigate('/messages');
    }
    setShowUserMenu(false);
  };

  const handleCollaborationsClick = () => {
    if (onNavigateToCollaborations) {
      onNavigateToCollaborations();
    } else {
      navigate(`/profile/${user?.id}?tab=collaborations`);
    }
    setShowUserMenu(false);
  };

  // Close user menu and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('.mobile-menu-button')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add the user menu with connections and messages links
  const renderUserMenu = () => {
    return (
      <div 
        ref={userMenuRef}
        className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50 ${showUserMenu ? 'block' : 'hidden'}`}
      >
        <Link
          to={user ? `/profile/${user.id}` : "/auth"}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={() => setShowUserMenu(false)}
        >
          <UserCircle className="inline-block h-4 w-4 mr-2" />
          Profile
        </Link>
        
        <Link
          to={user ? `/profile/${user.id}?tab=connections` : "/auth"}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={() => setShowUserMenu(false)}
        >
          <Users className="inline-block h-4 w-4 mr-2" />
          Connections
        </Link>
        
        <Link
          to={user ? `/profile/${user.id}?tab=collaborations` : "/auth"}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={() => setShowUserMenu(false)}
        >
          <Briefcase className="inline-block h-4 w-4 mr-2" />
          Collaborations
        </Link>
        
        <Link
          to="/messages"
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={() => setShowUserMenu(false)}
        >
          <MessageSquare className="inline-block h-4 w-4 mr-2" />
          Messages
        </Link>
        
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="inline-block h-4 w-4 mr-2" />
          Sign out
        </button>
      </div>
    );
  };

  // Add the mobile menu with connections and messages links
  const renderMobileMenu = () => {
    return (
      <div 
        ref={mobileMenuRef}
        className={`fixed inset-0 z-50 bg-white ${showMobileMenu ? 'block' : 'hidden'}`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <div className="font-bold text-xl">Menu</div>
          <button 
            onClick={() => setShowMobileMenu(false)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4">
          <ul className="space-y-4">
            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    to={user ? `/profile/${user.id}` : "/auth"}
                    className="flex items-center text-gray-700 hover:text-indigo-600"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <UserCircle className="h-5 w-5 mr-2" />
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/connections"
                    className="flex items-center text-gray-700 hover:text-indigo-600"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Connections
                  </Link>
                </li>
                <li>
                  <Link
                    to={user ? `/profile/${user.id}?tab=collaborations` : "/auth"}
                    className="flex items-center text-gray-700 hover:text-indigo-600"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Briefcase className="h-5 w-5 mr-2" />
                    Collaborations
                  </Link>
                </li>
                <li>
                  <Link
                    to="/messages"
                    className="flex items-center text-gray-700 hover:text-indigo-600"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Messages
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center text-gray-700 hover:text-indigo-600"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/auth"
                  className="flex items-center text-gray-700 hover:text-indigo-600"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign in
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              to="/"
              className="text-2xl font-bold text-indigo-600 focus:outline-none cursor-pointer"
            >
              Saned
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/workspace?filter=challenges"
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium focus:outline-none cursor-pointer"
            >
              Challenges
            </Link>
            <Link 
              to="/workspace?filter=partnerships"
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium focus:outline-none cursor-pointer"
            >
              Partnerships
            </Link>
            <Link 
              to="/workspace?filter=ideas"
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium focus:outline-none cursor-pointer"
            >
              Ideas
            </Link>
            <Link 
              to="/innovators"
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium focus:outline-none cursor-pointer"
            >
              Innovators
            </Link>
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
                        onError={(e) => {
                          // If image fails to load, replace with UserCircle icon
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const icon = document.createElement('div');
                            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path></svg>';
                            parent.appendChild(icon.firstChild as Node);
                          }
                        }}
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
                  
                  {showUserMenu && renderUserMenu()}
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login / Register
              </Link>
            )}
            <button 
              className="md:hidden text-gray-500 hover:text-indigo-600 focus:outline-none cursor-pointer mobile-menu-button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {showMobileMenu && renderMobileMenu()}
    </header>
  );
}