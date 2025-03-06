import React from 'react';
import { Innovator } from '../types';
import { Building, User, Briefcase, GraduationCap, DollarSign } from 'lucide-react';

interface InnovatorsListProps {
  innovators: Innovator[];
  onViewProfile?: (id: string) => void;
}

export function InnovatorsList({ innovators, onViewProfile }: InnovatorsListProps) {
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
      case 'individual':
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  // Function to get background color based on innovator type
  const getProfileBackground = (image: string) => {
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

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Innovators Directory</h2>
      <p className="text-gray-600 max-w-3xl">
        Connect with innovators from various sectors including startups, corporations, research institutions, 
        and individual experts who are part of the SANAD innovation ecosystem.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {innovators.map((innovator) => (
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
    </div>
  );
} 