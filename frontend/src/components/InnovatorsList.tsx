import React, { useState } from 'react';
import { Innovator } from '../types';
import { Building, User, Briefcase, GraduationCap, DollarSign, Zap, Lightbulb, Landmark, Users } from 'lucide-react';
import { INNOVATOR_TYPES, ROLE_DISPLAY_NAMES } from '../constants/roles';

interface InnovatorsListProps {
  innovators: Innovator[];
  onViewProfile?: (id: string) => void;
}

export function InnovatorsList({ innovators, onViewProfile }: InnovatorsListProps) {
  // State for active filter
  const [activeFilter, setActiveFilter] = useState<string>('all');

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
  const getProfileBackground = (image?: string) => {
    if (!image) return 'bg-gradient-to-r from-gray-400 to-gray-500';
    if (image === 'blue-gradient') return 'bg-gradient-to-r from-blue-400 to-indigo-500';
    if (image === 'purple-gradient') return 'bg-gradient-to-r from-purple-400 to-pink-500';
    if (image === 'green-gradient') return 'bg-gradient-to-r from-green-400 to-emerald-500';
    if (image === 'orange-gradient') return 'bg-gradient-to-r from-orange-400 to-amber-500';
    if (image === 'teal-gradient') return 'bg-gradient-to-r from-teal-400 to-cyan-500';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  // Handle view profile click
  const handleViewProfile = (id: string) => {
    if (onViewProfile) {
      onViewProfile(id);
    }
  };

  // Filter innovators based on active filter
  const filteredInnovators = activeFilter === 'all' 
    ? innovators 
    : innovators.filter(innovator => innovator.type === activeFilter);

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
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Innovators Directory</h2>
      <p className="text-gray-600 max-w-3xl">
        Connect with innovators from various sectors including startups, corporations, research institutions, 
        and individual experts who are part of the Saned innovation ecosystem.
      </p>
      
      {/* Innovator Type Filter */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <nav className="flex border-b border-gray-200">
              {innovatorTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveFilter(type.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center space-x-1
                    ${activeFilter === type.id
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {type.id !== 'all' && getInnovatorIcon(type.id)}
                  <span>{type.label}</span>
                  <span className="ml-1.5 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                    {type.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInnovators.map((innovator) => (
          <div 
            key={innovator.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className={`h-24 ${getProfileBackground(innovator.profileImage)}`} />
            <div className="p-6">
              <div className="flex items-center mb-4">
                {getInnovatorIcon(innovator.type)}
                <span className="ml-2 text-sm font-medium text-gray-500 capitalize">
                  {innovator.type}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{innovator.name}</h3>
              <p className="text-gray-600 mb-4">{innovator.description}</p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {innovator.expertise.map((skill, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => handleViewProfile(innovator.id)}
                className="w-full mt-2 inline-flex justify-center items-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Show message when no innovators match the filter */}
      {filteredInnovators.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No innovators found for this filter.</p>
        </div>
      )}
    </div>
  );
} 