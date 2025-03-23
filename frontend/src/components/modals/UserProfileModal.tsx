import React, { useState } from 'react';
import { X, User, MapPin, Briefcase, Building, Globe, Mail, MessageSquare, UserPlus, Download, Link as LinkIcon, Linkedin, Twitter, Github } from 'lucide-react';
import { User as UserType, Innovator } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { getUserById } from '../../services/users';

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, isOpen, onClose, onSendMessage }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data when modal opens
  React.useEffect(() => {
    if (isOpen && userId) {
      setIsLoading(true);
      setError(null);
      
      getUserById(userId)
        .then(userData => {
          setUser(userData);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching user profile:', err);
          setError('Failed to load user profile');
          setIsLoading(false);
        });
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleSendMessage = () => {
    if (onSendMessage) {
      onSendMessage();
    } else if (user) {
      navigate(`/messages/${user.id}`);
      onClose();
    }
  };

  const viewFullProfile = () => {
    if (user) {
      navigate(`/profile/${user.id}`);
      onClose();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Error</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-red-500 mb-4">{error || 'Could not load user profile'}</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Profile</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile content */}
        <div className="p-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6">
            {/* Profile image */}
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-indigo-600" />
              )}
            </div>

            {/* User info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.firstName} {user.lastName}</h1>
              <p className="text-gray-600 mb-2">
                {user.position} {user.organization ? `at ${user.organization}` : ''}
              </p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
                {user.location && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                {user.website && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Globe className="h-4 w-4 mr-1" />
                    <a 
                      href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600"
                    >
                      {user.website.replace(/^(https?:\/\/)?(www\.)?/, '')}
                    </a>
                  </div>
                )}
              </div>

              {/* Social links */}
              {user.social && (
                <div className="flex justify-center sm:justify-start space-x-3 mb-4">
                  {user.social.linkedin && (
                    <a 
                      href={user.social.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-indigo-600"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {user.social.twitter && (
                    <a 
                      href={user.social.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-indigo-600"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {user.social.github && (
                    <a 
                      href={user.social.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-indigo-600"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}

              {/* Description */}
              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}

              {/* Expertise */}
              {user.expertise && user.expertise.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.expertise.map((item, index) => (
                      <span 
                        key={index}
                        className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-center sm:justify-end border-t border-gray-200 pt-4">
            <button
              onClick={handleSendMessage}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </button>
            <button
              onClick={viewFullProfile}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <User className="h-4 w-4 mr-2" />
              View Full Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal; 