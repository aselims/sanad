import React, { useState, useRef, useEffect } from 'react';
import { Menu, UserCircle, LogOut, Settings, X, Users, MessageSquare, Briefcase, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SearchComponent } from './SearchComponent';
import { SearchResults } from '../services/search';
import { NotificationDropdown } from './NotificationDropdown';

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

interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
  className?: string;
}

const MenuItem = ({ icon, text, onClick, className = '' }: MenuItemProps) => (
  <button
    onClick={onClick}
    className={`flex items-center text-gray-700 hover:text-indigo-600 w-full text-left ${className}`}
  >
    <span className="inline-flex items-center justify-center mr-2">{icon}</span>
    <span>{text}</span>
  </button>
);

const LinkMenuItem = ({ icon, text, to, onClick, className = '' }: MenuItemProps & { to: string }) => (
  <Link
    to={to}
    className={`flex items-center text-gray-700 hover:text-indigo-600 ${className}`}
    onClick={onClick}
  >
    <span className="inline-flex items-center justify-center mr-2">{icon}</span>
    <span>{text}</span>
  </Link>
);

export function Header({ 
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  // Helper function for navigation
  const handleNavigation = (callback?: () => void, defaultPath?: string) => {
    return () => {
      if (callback) {
        callback();
      } else if (defaultPath) {
        navigate(defaultPath);
      }
      setShowUserMenu(false);
      setShowMobileMenu(false);
    };
  };

  // Navigation handlers
  const navHandlers = {
    challenges: handleNavigation(onNavigateToChallenges, '/workspace?filter=challenges'),
    partnerships: handleNavigation(onNavigateToPartnerships, '/workspace?filter=partnerships'),
    ideas: handleNavigation(onNavigateToIdeas, '/workspace?filter=ideas'),
    innovators: handleNavigation(onNavigateToInnovators, '/innovators'),
    home: handleNavigation(onNavigateToHome, '/'),
    profile: handleNavigation(onNavigateToProfile, user ? `/profile/${user.id}` : '/auth'),
    connections: handleNavigation(onNavigateToConnections, user ? `/profile/${user.id}?tab=connections` : '/auth'),
    collaborations: handleNavigation(onNavigateToCollaborations, user ? `/profile/${user.id}?tab=collaborations` : '/auth'),
    messages: handleNavigation(onNavigateToMessages, user ? `/profile/${user.id}?tab=messages` : '/auth'),
    auth: handleNavigation(onNavigateToAuth, '/auth'),
    logout: () => {
      logout();
      setShowUserMenu(false);
      setShowMobileMenu(false);
    },
    search: () => setIsSearchOpen(true),
    closeSearch: () => setIsSearchOpen(false)
  };

  // Close menus when clicking outside
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

  // Menu items configuration
  const menuItems = [
    {
      icon: <UserCircle className="h-5 w-5" />,
      text: 'Profile',
      to: user ? `/profile/${user.id}` : "/auth",
      onClick: navHandlers.profile
    },
    {
      icon: <Users className="h-5 w-5" />,
      text: 'Connections',
      to: user ? `/profile/${user.id}?tab=connections` : "/auth",
      onClick: navHandlers.connections
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      text: 'Collaborations',
      to: user ? `/profile/${user.id}?tab=collaborations` : "/auth",
      onClick: navHandlers.collaborations
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      text: 'Messages',
      to: user ? `/profile/${user.id}?tab=messages` : "/auth",
      onClick: navHandlers.messages
    }
  ];

  // User menu component
  const renderUserMenu = () => (
    <div 
      ref={userMenuRef}
      className={`absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50 ${showUserMenu ? 'block' : 'hidden'}`}
    >
      {menuItems.map((item, index) => (
        <Link
          key={index}
          to={item.to}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={() => setShowUserMenu(false)}
        >
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center mr-2">{item.icon}</span>
            <span>{item.text}</span>
          </div>
        </Link>
      ))}
      
      <button
        onClick={navHandlers.logout}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <div className="flex items-center">
          <LogOut className="h-5 w-5 mr-2" />
          <span>Sign out</span>
        </div>
      </button>
    </div>
  );

  // Mobile menu component
  const renderMobileMenu = () => (
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
          <li>
            <MenuItem 
              icon={<Search className="h-6 w-6 mr-2" />}
              text="Search"
              onClick={() => {
                setShowMobileMenu(false);
                navHandlers.search();
              }}
            />
          </li>
          
          {isAuthenticated ? (
            <>
              {menuItems.map((item, index) => (
                <li key={index}>
                  <LinkMenuItem 
                    icon={item.icon}
                    text={item.text}
                    to={item.to}
                    onClick={() => setShowMobileMenu(false)}
                  />
                </li>
              ))}
              <li>
                <MenuItem 
                  icon={<LogOut className="h-6 w-6 mr-2" />}
                  text="Sign out"
                  onClick={navHandlers.logout}
                />
              </li>
            </>
          ) : (
            <li>
              <LinkMenuItem 
                icon={<UserCircle className="h-6 w-6 mr-2" />}
                text="Sign in"
                to="/auth"
                onClick={() => setShowMobileMenu(false)}
              />
            </li>
          )}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                to="/"
                className="text-2xl font-bold text-indigo-600 focus:outline-none cursor-pointer"
                onClick={navHandlers.home}
              >
                Saned
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link 
                to="/workspace?filter=challenges"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium focus:outline-none cursor-pointer"
                onClick={navHandlers.challenges}
              >
                Challenges
              </Link>
              <Link 
                to="/workspace?filter=partnerships"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium focus:outline-none cursor-pointer"
                onClick={navHandlers.partnerships}
              >
                Partnerships
              </Link>
              <Link 
                to="/workspace?filter=ideas"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium focus:outline-none cursor-pointer"
                onClick={navHandlers.ideas}
              >
                Ideas
              </Link>
              <Link 
                to="/innovators"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium focus:outline-none cursor-pointer"
                onClick={navHandlers.innovators}
              >
                Innovators
              </Link>
            </nav>

            <div className="flex items-center h-16 space-x-4">
              {/* Search Button */}
              <button 
                onClick={navHandlers.search}
                className="text-gray-500 hover:text-indigo-600 focus:outline-none cursor-pointer h-full px-2 flex items-center"
                aria-label="Search"
              >
                <Search className="h-6 w-6" />
              </button>
              
              {isAuthenticated ? (
                <>
                  <div className="h-full flex items-center px-2">
                    <NotificationDropdown 
                      isOpen={showNotificationsMenu}
                      setIsOpen={setShowNotificationsMenu}
                    />
                  </div>
                  <div className="relative h-full flex items-center" ref={userMenuRef}>
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="text-gray-500 hover:text-indigo-600 focus:outline-none cursor-pointer h-full flex items-center"
                    >
                      {user?.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt={`${user.firstName} ${user.lastName}`} 
                          className="h-8 w-8 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const icon = document.createElement('div');
                              icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6" style="display: block"><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path></svg>';
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
                  onClick={navHandlers.auth}
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

      {/* Search Component */}
      <SearchComponent 
        isOpen={isSearchOpen}
        onClose={navHandlers.closeSearch}
      />
    </>
  );
}