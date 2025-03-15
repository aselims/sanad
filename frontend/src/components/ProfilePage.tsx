import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Users, 
  Award,
  Bell,
  Calendar,
  FileText,
  Link as LinkIcon,
  Star,
  Target,
  ThumbsUp,
  Edit,
  Zap
} from 'lucide-react';
import { Innovator, Collaboration, User as UserType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ProtectedAction from './auth/ProtectedAction';
import EditProfileModal from './EditProfileModal';
import { connectWithUser, sendMessageToUser, updateCurrentUserProfile } from '../services/users';
import { findPotentialMatches } from '../utils/matchUtils';
import { getPotentialMatches, saveMatchPreference } from '../services/matches';
import { useNavigate } from 'react-router-dom';

interface ProfilePageProps {
  user: Innovator;
  potentialMatches?: Innovator[];
  matchRequests?: {
    innovator: Innovator;
    challenge: Collaboration;
    message: string;
    date: string;
  }[];
  onBack?: () => void;
}

export function ProfilePage({ 
  user, 
  potentialMatches = [], 
  matchRequests = [], 
  onBack
}: ProfilePageProps) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'potential-matches' | 'match-requests'>('profile');
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState<Innovator>(user);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [messageStatus, setMessageStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [matches, setMatches] = useState<Innovator[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchPreferences, setMatchPreferences] = useState<Record<string, 'like' | 'dislike'>>({});
  const [preferenceStatus, setPreferenceStatus] = useState<{id: string, status: 'saving' | 'success' | 'error' | null}>({id: '', status: null});

  // Check if this is the current user's profile
  const isOwnProfile = currentUser && currentUser.id === user.id;

  // Reset activeTab to 'profile' if a non-authenticated user tries to access a protected tab
  useEffect(() => {
    if ((!isAuthenticated || !isOwnProfile) && 
        (activeTab === 'potential-matches' || activeTab === 'match-requests')) {
      setActiveTab('profile');
    }
  }, [isAuthenticated, isOwnProfile, activeTab]);

  // Add useEffect to fetch matches when tab changes
  useEffect(() => {
    const fetchMatches = async () => {
      if (activeTab === 'potential-matches' && isAuthenticated && isOwnProfile) {
        setIsLoadingMatches(true);
        try {
          const potentialMatches = await getPotentialMatches(user.id);
          setMatches(potentialMatches);
        } catch (error) {
          console.error('Error fetching potential matches:', error);
        } finally {
          setIsLoadingMatches(false);
        }
      }
    };

    fetchMatches();
  }, [activeTab, isAuthenticated, isOwnProfile, user.id]);

  // Function to handle connect action
  const handleConnect = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setConnectionStatus('pending');
    setError(null);
    
    try {
      await connectWithUser(profileData.id);
      console.log('Successfully connected with', profileData.name);
      // Show success message
      setConnectionStatus('success');
      // Reset status after 3 seconds
      setTimeout(() => {
        setConnectionStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error connecting with user:', error);
      setError('Failed to connect with user. Please try again.');
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle message action
  const handleMessage = async () => {
    if (!isAuthenticated) return;
    setShowMessageModal(true);
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    
    setMessageStatus('pending');
    
    try {
      await sendMessageToUser(profileData.id, messageText);
      setMessageStatus('success');
      setMessageText('');
      
      // Close modal after success
      setTimeout(() => {
        setShowMessageModal(false);
        setMessageStatus('idle');
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageStatus('error');
      
      // Reset status after error
      setTimeout(() => {
        setMessageStatus('idle');
      }, 3000);
    }
  };

  // Function to handle edit profile action
  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  // Function to handle save profile changes
  const handleSaveProfile = async (updatedUser: Partial<Innovator>) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert Innovator format to User format for the API
      const userData: Partial<UserType> = {
        firstName: updatedUser.name?.split(' ')[0],
        lastName: updatedUser.name?.split(' ').slice(1).join(' '),
        organization: updatedUser.organization,
        bio: updatedUser.description,
        role: updatedUser.type,
        position: updatedUser.position,
        // Add any other fields that the API supports
      };
      
      // Update the user profile via API
      const result = await updateCurrentUserProfile(userData);
      
      if (result) {
        // Update the local state with the new profile data
        setProfileData(prevData => ({
          ...prevData,
          ...updatedUser
        }));
        
        console.log('Profile updated successfully');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An error occurred while updating your profile.');
    } finally {
      setIsLoading(false);
      setShowEditModal(false);
    }
  };

  // Function to handle match preference
  const handleMatchPreference = async (targetUserId: string, preference: 'like' | 'dislike') => {
    try {
      setPreferenceStatus({id: targetUserId, status: 'saving'});
      await saveMatchPreference(user.id, targetUserId, preference);
      setMatchPreferences(prev => ({
        ...prev,
        [targetUserId]: preference
      }));
      setPreferenceStatus({id: targetUserId, status: 'success'});
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setPreferenceStatus({id: '', status: null});
      }, 2000);
    } catch (error) {
      console.error('Error saving match preference:', error);
      setPreferenceStatus({id: targetUserId, status: 'error'});
      
      // Reset error status after 3 seconds
      setTimeout(() => {
        setPreferenceStatus({id: '', status: null});
      }, 3000);
    }
  };

  // Function to navigate to a user's profile
  const handleViewProfile = (innovatorId: string) => {
    console.log(`Navigating to profile: /profile/${innovatorId}`);
    navigate(`/profile/${innovatorId}`);
  };

  // Function to render different content based on user type
  const renderTypeSpecificFields = () => {
    switch (profileData.type) {
      case 'investor':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Investment Focus</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Seed Stage
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Series A
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Sustainability
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Clean Tech
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Investment Portfolio</h3>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">EcoTech Solutions</h4>
                      <p className="text-xs text-gray-500">Renewable Energy • 2021</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Building className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">AgriTech Innovations</h4>
                      <p className="text-xs text-gray-500">AgTech • 2022</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Investment Criteria</h3>
              <div className="mt-2 space-y-3">
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Investment Range</h4>
                    <p className="text-sm text-gray-500">$500K - $2M</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Target className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Target ROI</h4>
                    <p className="text-sm text-gray-500">3-5x within 5 years</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Geographic Focus</h4>
                    <p className="text-sm text-gray-500">Middle East, North Africa, Europe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'startup':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
              <div className="mt-2 space-y-3">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Founded</h4>
                    <p className="text-sm text-gray-500">2020</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Team Size</h4>
                    <p className="text-sm text-gray-500">15-30 employees</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Funding Stage</h4>
                    <p className="text-sm text-gray-500">Series A</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Product & Technology</h3>
              <div className="mt-2 space-y-3">
                <p className="text-sm text-gray-600">
                  Our AI-driven platform helps organizations optimize their energy consumption through real-time monitoring and predictive analytics.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Machine Learning
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    IoT
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Cloud Computing
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Traction & Achievements</h3>
              <div className="mt-2 space-y-3">
                <div className="flex items-start">
                  <Award className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Awards</h4>
                    <p className="text-sm text-gray-500">Sustainability Innovation Award 2022</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ThumbsUp className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Key Metrics</h4>
                    <p className="text-sm text-gray-500">30% MoM growth, 25+ enterprise clients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'research':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Research Focus</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Medical Imaging
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  AI in Healthcare
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Diagnostics
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Publications</h3>
              <div className="mt-2 space-y-3">
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Recent Publications</h4>
                    <p className="text-sm text-gray-500">15+ peer-reviewed articles in leading journals</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <LinkIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Research Repository</h4>
                    <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">View Publications</a>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Facilities & Resources</h3>
              <div className="mt-2 space-y-3">
                <p className="text-sm text-gray-600">
                  State-of-the-art laboratories equipped with advanced imaging technology and computing resources for AI model training.
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Professional Background</h3>
              <div className="mt-2 space-y-3">
                <p className="text-sm text-gray-600">
                  {profileData.description}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Areas of Expertise</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {profileData.expertise.map((skill, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  // Function to render the profile tab content
  const renderProfileContent = () => {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center">
            <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
              {profileData.profileImage ? (
                <img 
                  src={profileData.profileImage} 
                  alt={profileData.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-indigo-600" />
              )}
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
              <p className="text-gray-600">{profileData.position} {profileData.organization ? `at ${profileData.organization}` : ''}</p>
              
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-2">
                {profileData.type}
              </span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            {isOwnProfile ? (
              <button
                onClick={handleEditProfile}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal and organizational details.</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name / Organization</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profileData.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{profileData.type}</dd>
              </div>
              {profileData.position && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Position/Title</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profileData.position}</dd>
                </div>
              )}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {profileData.email || `contact@${profileData.organization.toLowerCase().replace(/\s+/g, '')}.com`}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Riyadh, Saudi Arabia</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">About</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {profileData.description}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Type-specific information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {profileData.type === 'investor' ? 'Investment Information' : 
               profileData.type === 'startup' ? 'Company Information' :
               profileData.type === 'research' ? 'Research Information' : 'Professional Information'}
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            {renderTypeSpecificFields()}
          </div>
        </div>
      </div>
    );
  };

  // Function to render potential matches tab content
  const renderPotentialMatchesContent = () => {
    if (isLoadingMatches) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Calculate matches using the new matching logic
    const matchResults = findPotentialMatches(user, matches);

    // Sort matches: liked profiles at the top, then others (excluding disliked)
    const sortedMatches = matchResults
      .filter(match => matchPreferences[match.innovator.id] !== 'dislike') // Hide disliked profiles
      .sort((a, b) => {
        // Sort liked profiles to the top
        if (matchPreferences[a.innovator.id] === 'like' && matchPreferences[b.innovator.id] !== 'like') {
          return -1;
        }
        if (matchPreferences[a.innovator.id] !== 'like' && matchPreferences[b.innovator.id] === 'like') {
          return 1;
        }
        // For profiles with the same preference status, sort by match score
        return b.matchScore - a.matchScore;
      });

    return (
      <div className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">AI-Suggested Matches</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Innovators that match your interests and requirements based on AI analysis.
              {Object.values(matchPreferences).filter(pref => pref === 'dislike').length > 0 && (
                <span className="ml-1 text-gray-400 italic">
                  (Disliked profiles are hidden)
                </span>
              )}
            </p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {sortedMatches.length > 0 ? (
                sortedMatches.map((match) => (
                  <li key={match.innovator.id} className={`px-4 py-4 sm:px-6 hover:bg-gray-50 ${
                    matchPreferences[match.innovator.id] === 'like' ? 'bg-green-50' : ''
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          {match.innovator.type === 'startup' ? (
                            <Briefcase className="h-6 w-6 text-indigo-600" />
                          ) : match.innovator.type === 'research' ? (
                            <Award className="h-6 w-6 text-purple-600" />
                          ) : (
                            <User className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{match.innovator.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{match.innovator.type}</div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-400" />
                          <span className="ml-1 text-sm text-gray-600">{match.matchScore}% Match</span>
                          {matchPreferences[match.innovator.id] === 'like' && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Liked
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <button 
                            onClick={() => handleViewProfile(match.innovator.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Highlight section */}
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-md">
                      <p className="text-sm flex items-start">
                        <Zap className="h-4 w-4 text-amber-500 mr-1 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{match.highlight}</span>
                      </p>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm text-gray-600 line-clamp-2">{match.innovator.description}</p>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-1">
                      {match.sharedTags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {match.sharedTags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          +{match.sharedTags.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => handleMatchPreference(match.innovator.id, 'like')}
                        disabled={preferenceStatus.id === match.innovator.id && preferenceStatus.status === 'saving'}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md ${
                          matchPreferences[match.innovator.id] === 'like'
                            ? 'text-white bg-green-600 hover:bg-green-700'
                            : 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300'
                        }`}
                      >
                        {preferenceStatus.id === match.innovator.id && preferenceStatus.status === 'saving' ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          <>
                            {matchPreferences[match.innovator.id] === 'like' ? 'Liked' : 'Like'}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleMatchPreference(match.innovator.id, 'dislike')}
                        disabled={preferenceStatus.id === match.innovator.id && preferenceStatus.status === 'saving'}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md ${
                          matchPreferences[match.innovator.id] === 'dislike'
                            ? 'text-white bg-red-600 hover:bg-red-700'
                            : 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300'
                        }`}
                      >
                        {preferenceStatus.id === match.innovator.id && preferenceStatus.status === 'saving' ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          <>
                            Hide
                          </>
                        )}
                      </button>
                    </div>

                    {/* Show feedback message when preference is saved */}
                    {preferenceStatus.id === match.innovator.id && preferenceStatus.status === 'success' && (
                      <div className="mt-2 text-sm text-green-600">
                        Preference saved successfully!
                      </div>
                    )}
                    {preferenceStatus.id === match.innovator.id && preferenceStatus.status === 'error' && (
                      <div className="mt-2 text-sm text-red-600">
                        Error saving preference. Please try again.
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <li className="px-4 py-12 sm:px-6 text-center">
                  <div className="text-gray-500">
                    <p>No potential matches found at the moment.</p>
                    <p className="mt-1 text-sm">Check back later as our AI continues to analyze new innovators.</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Function to render match requests tab content
  const renderMatchRequestsContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Match Requests</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Innovators who have expressed interest in collaborating with you.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {matchRequests.length > 0 ? (
                matchRequests.map((request, index) => (
                  <li key={index} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          {request.innovator.type === 'startup' ? (
                            <Briefcase className="h-6 w-6 text-indigo-600" />
                          ) : request.innovator.type === 'research' ? (
                            <Award className="h-6 w-6 text-purple-600" />
                          ) : (
                            <User className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{request.innovator.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{request.innovator.type}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{request.date}</div>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium text-gray-900">Interested in: {request.challenge.title}</div>
                      <p className="mt-1 text-sm text-gray-600">{request.message}</p>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Accept Request
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Decline
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Message
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-12 sm:px-6 text-center">
                  <div className="text-gray-500">
                    <p>No match requests at the moment.</p>
                    <p className="mt-1 text-sm">When innovators express interest in your challenges, they will appear here.</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Message Modal
  const MessageModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Send Message to {profileData.name}</h3>
        
        {messageStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            Failed to send message. Please try again.
          </div>
        )}
        
        {messageStatus === 'success' && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
            Message sent successfully!
          </div>
        )}
        
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message here..."
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
          rows={4}
          disabled={messageStatus === 'pending' || messageStatus === 'success'}
        ></textarea>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowMessageModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={sendMessage}
            disabled={!messageText.trim() || messageStatus === 'pending' || messageStatus === 'success'}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {messageStatus === 'pending' ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send Message'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ← Back
        </button>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
              {profileData.type === 'investor' ? (
                <DollarSign className="h-10 w-10 text-white" />
              ) : profileData.type === 'startup' ? (
                <Briefcase className="h-10 w-10 text-white" />
              ) : profileData.type === 'research' ? (
                <Award className="h-10 w-10 text-white" />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{profileData.type}</p>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'text-indigo-600 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
              }`}
            >
              Profile
            </button>
            
            {/* Only show these tabs for authenticated users viewing their own profile */}
            {isAuthenticated && isOwnProfile && (
              <>
                <button
                  onClick={() => setActiveTab('potential-matches')}
                  className={`px-4 py-4 text-sm font-medium ${
                    activeTab === 'potential-matches'
                      ? 'text-indigo-600 border-b-2 border-indigo-500'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
                  }`}
                >
                  Potential Matches
                  {matches.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {matches.length}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('match-requests')}
                  className={`px-4 py-4 text-sm font-medium ${
                    activeTab === 'match-requests'
                      ? 'text-indigo-600 border-b-2 border-indigo-500'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
                  }`}
                >
                  Match Requests
                  {matchRequests.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {matchRequests.length}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Render content based on active tab */}
      {activeTab === 'profile' && renderProfileContent()}
      {activeTab === 'potential-matches' && renderPotentialMatchesContent()}
      {activeTab === 'match-requests' && renderMatchRequestsContent()}

      {/* Message Modal */}
      {showMessageModal && <MessageModal />}
    </div>
  );
}