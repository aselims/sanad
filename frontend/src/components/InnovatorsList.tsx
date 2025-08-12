import React, { useState, useEffect } from 'react';
import { Innovator } from '../types';
import { 
  Building, 
  User, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  Zap, 
  Lightbulb, 
  Landmark, 
  Users, 
  Search, 
  MapPin, 
  Globe, 
  Mail, 
  Filter, 
  X,
  ChevronDown,
  ArrowUpRight,
  Check,
  School,
  Laptop
} from 'lucide-react';
import { INNOVATOR_TYPES, ROLE_DISPLAY_NAMES } from '../constants/roles';
import UserProfileModal from './modals/UserProfileModal';

interface InnovatorsListProps {
  innovators: Innovator[];
  onViewProfile?: (id: string) => void;
}

export function InnovatorsList({ innovators, onViewProfile }: InnovatorsListProps) {
  // State for active filter
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // New state variables for the profile modal
  const [selectedInnovatorId, setSelectedInnovatorId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Get all unique expertise tags across all innovators
  const allExpertiseTags = Array.from(
    new Set(
      innovators.flatMap(innovator => innovator.expertise || [])
    )
  ).sort();

  // Function to get the appropriate icon based on innovator type
  const getInnovatorIcon = (type: string) => {
    switch (type) {
      case 'startup':
        return <Briefcase className="h-5 w-5 text-indigo-500" />;
      case 'corporate':
        return <Building className="h-5 w-5 text-blue-500" />;
      case 'research':
        return <GraduationCap className="h-5 w-5 text-purple-500" />;
      case 'investor':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'government':
        return <Landmark className="h-5 w-5 text-red-500" />;
      case 'accelerator':
        return <Zap className="h-5 w-5 text-amber-500" />;
      case 'incubator':
        return <Lightbulb className="h-5 w-5 text-orange-500" />;
      case 'individual':
        return <User className="h-5 w-5 text-gray-500" />;
      default:
        return <Users className="h-5 w-5 text-gray-500" />;
    }
  };

  // Function to get background color based on innovator type
  const getProfileBackground = (type: string, image?: string) => {
    if (image) {
      if (image === 'blue-gradient') return 'bg-gradient-to-r from-blue-400 to-indigo-500';
      if (image === 'purple-gradient') return 'bg-gradient-to-r from-purple-400 to-pink-500';
      if (image === 'green-gradient') return 'bg-gradient-to-r from-green-400 to-emerald-500';
      if (image === 'orange-gradient') return 'bg-gradient-to-r from-orange-400 to-amber-500';
      if (image === 'teal-gradient') return 'bg-gradient-to-r from-teal-400 to-cyan-500';
      return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
    
    // Default gradients based on type if no image is provided
    switch (type) {
      case 'startup':
        return 'bg-gradient-to-r from-indigo-400 to-blue-500';
      case 'corporate':
        return 'bg-gradient-to-r from-blue-400 to-sky-500';
      case 'research':
        return 'bg-gradient-to-r from-purple-400 to-violet-500';
      case 'investor':
        return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'government':
        return 'bg-gradient-to-r from-red-400 to-rose-500';
      case 'accelerator':
        return 'bg-gradient-to-r from-amber-400 to-yellow-500';
      case 'incubator':
        return 'bg-gradient-to-r from-orange-400 to-amber-500';
      case 'individual':
        return 'bg-gradient-to-r from-gray-400 to-slate-500';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  // Handle view profile click
  const handleViewProfile = (id: string) => {
    if (onViewProfile) {
      onViewProfile(id);
    } else {
      setSelectedInnovatorId(id);
      setIsProfileModalOpen(true);
    }
  };

  // Toggle expertise filter
  const toggleExpertise = (expertise: string) => {
    if (selectedExpertise.includes(expertise)) {
      setSelectedExpertise(selectedExpertise.filter(e => e !== expertise));
    } else {
      setSelectedExpertise([...selectedExpertise, expertise]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
    setSelectedExpertise([]);
  };

  // Filter innovators based on all active filters
  const filteredInnovators = innovators.filter(innovator => {
    // Type filter
    const typeMatch = activeFilter === 'all' || innovator.type === activeFilter;
    
    // Search query filter
    const searchMatch = !searchQuery || 
      innovator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      innovator.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      innovator.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (innovator.location && innovator.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Expertise filter
    const expertiseMatch = selectedExpertise.length === 0 || 
      selectedExpertise.some(expertise => 
        innovator.expertise && innovator.expertise.includes(expertise)
      );
    
    return typeMatch && searchMatch && expertiseMatch;
  });

  // Get count of each innovator type
  const getTypeCount = (type: string) => {
    return innovators.filter(innovator => innovator.type === type).length;
  };

  // Array of all innovator types for the filter
  const innovatorTypes = [
    { id: 'all', label: 'All Innovators', count: innovators.length },
    { id: 'startup', label: ROLE_DISPLAY_NAMES.startup, count: getTypeCount('startup') },
    { id: 'research', label: ROLE_DISPLAY_NAMES.research, count: getTypeCount('research') },
    { id: 'corporate', label: ROLE_DISPLAY_NAMES.corporate, count: getTypeCount('corporate') },
    { id: 'government', label: ROLE_DISPLAY_NAMES.government, count: getTypeCount('government') },
    { id: 'investor', label: ROLE_DISPLAY_NAMES.investor, count: getTypeCount('investor') },
    { id: 'individual', label: ROLE_DISPLAY_NAMES.individual, count: getTypeCount('individual') },
    { id: 'accelerator', label: ROLE_DISPLAY_NAMES.accelerator, count: getTypeCount('accelerator') },
    { id: 'incubator', label: ROLE_DISPLAY_NAMES.incubator, count: getTypeCount('incubator') },
  ].filter(type => type.count > 0); // Only show types that have innovators

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Innovators Directory</h2>
          <p className="text-gray-600 max-w-3xl mt-2">
            Connect with innovators from various sectors including startups, corporations, research institutions, 
            and individual experts who are part of the Collopi innovation ecosystem.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="bg-white rounded-lg border border-gray-200 flex">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                viewMode === 'grid' 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                viewMode === 'list' 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Filter toggle button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Search and filters section */}
      <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-96' : 'max-h-0'}`}>
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Search bar */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Innovators
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by name, description, organization, or location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Expertise tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Expertise
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2">
              {allExpertiseTags.map(expertise => (
                <button
                  key={expertise}
                  onClick={() => toggleExpertise(expertise)}
                  className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                    selectedExpertise.includes(expertise)
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {expertise}
                </button>
              ))}
            </div>
          </div>
          
          {/* Active filters summary */}
          {(activeFilter !== 'all' || searchQuery || selectedExpertise.length > 0) && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <span className="font-medium">{filteredInnovators.length}</span> results found
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Innovator Type Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {innovatorTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveFilter(type.id)}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
              activeFilter === type.id 
                ? type.id === 'all'
                  ? 'bg-gray-900 text-white'
                  : getTypeButtonStyle(type.id)
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {type.id !== 'all' && (
              <span className="mr-1.5">{getInnovatorIcon(type.id)}</span>
            )}
            {type.label}
            <span className="ml-1.5 py-0.5 px-2 rounded-full text-xs bg-white bg-opacity-20 text-white">
              {type.count}
            </span>
          </button>
        ))}
      </div>
      
      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInnovators.map((innovator) => (
            <div 
              key={innovator.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`h-28 ${getProfileBackground(innovator.type, innovator.profileImage)} relative`}>
                <div className="absolute bottom-0 right-0 m-4 bg-white rounded-full p-2 shadow-md">
                  {getInnovatorIcon(innovator.type)}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{innovator.name}</h3>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                    {innovator.type}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{innovator.description}</p>
                
                {/* Organization and Location */}
                {(innovator.organization || innovator.location) && (
                  <div className="mb-4 space-y-1">
                    {innovator.organization && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Building className="h-4 w-4 mr-1.5 text-gray-400" />
                        <span>{innovator.organization}</span>
                      </div>
                    )}
                    {innovator.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                        <span>{innovator.location}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Expertise Tags */}
                {innovator.expertise && innovator.expertise.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Expertise</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {innovator.expertise.slice(0, 3).map((skill, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {innovator.expertise.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          +{innovator.expertise.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => handleViewProfile(innovator.id)}
                  className="w-full mt-2 inline-flex justify-center items-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  View Profile
                  <ArrowUpRight className="ml-1.5 h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredInnovators.map((innovator) => (
            <div 
              key={innovator.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col sm:flex-row">
                <div className={`w-full sm:w-24 h-24 ${getProfileBackground(innovator.type, innovator.profileImage)} flex items-center justify-center`}>
                  <div className="bg-white rounded-full p-2 shadow-md">
                    {getInnovatorIcon(innovator.type)}
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{innovator.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                          {innovator.type}
                        </span>
                        {innovator.organization && (
                          <span className="ml-2 text-sm text-gray-500 flex items-center">
                            <Building className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            {innovator.organization}
                          </span>
                        )}
                        {innovator.location && (
                          <span className="ml-2 text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            {innovator.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleViewProfile(innovator.id)}
                      className="mt-3 sm:mt-0 inline-flex items-center px-3 py-1.5 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      View Profile
                      <ArrowUpRight className="ml-1.5 h-4 w-4" />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{innovator.description}</p>
                  
                  {/* Expertise Tags */}
                  {innovator.expertise && innovator.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {innovator.expertise.map((skill, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Show message when no innovators match the filter */}
      {filteredInnovators.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No innovators found</h3>
          <p className="text-gray-500">
            No innovators match your current filters. Try adjusting your search criteria.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Clear all filters
          </button>
        </div>
      )}

      {selectedInnovatorId && !onViewProfile && (
        <UserProfileModal
          userId={selectedInnovatorId}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
}

// Helper function to get button style based on innovator type
function getTypeButtonStyle(type: string): string {
  switch (type) {
    case 'startup':
      return 'bg-indigo-600 text-white';
    case 'corporate':
      return 'bg-blue-600 text-white';
    case 'research':
      return 'bg-purple-600 text-white';
    case 'investor':
      return 'bg-green-600 text-white';
    case 'government':
      return 'bg-red-600 text-white';
    case 'accelerator':
      return 'bg-amber-600 text-white';
    case 'incubator':
      return 'bg-orange-600 text-white';
    case 'individual':
      return 'bg-gray-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
} 