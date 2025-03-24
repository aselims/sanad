import React, { useState, useEffect, useRef } from 'react';
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
  Zap,
  ArrowLeft,
  Check,
  UserPlus,
  MessageSquare,
  X,
  Clock,
  Rocket,
  Home,
  Eye,
  ThumbsDown,
  UserX
} from 'lucide-react';
import { Innovator, Collaboration, User as UserType, Message, Conversation, Connection, ConnectionStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ProtectedAction from './auth/ProtectedAction';
import EditProfileModal from './EditProfileModal';
import { connectWithUser, sendMessageToUser, updateCurrentUserProfile } from '../services/users';
import { findPotentialMatches } from '../utils/matchUtils';
import { getPotentialMatches, saveMatchPreference } from '../services/matches';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getUserConnections, getConnectionRequests, respondToConnectionRequest } from '../services/connections';
import { getUserCollaborations } from '../services/collaborations';
import UserProfileModal from './modals/UserProfileModal';

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
  isLoading?: boolean;
}

export function ProfilePage({ 
  user, 
  potentialMatches = [], 
  matchRequests = [], 
  onBack,
  isLoading: externalLoading
}: ProfilePageProps) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for tab query parameter
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  // Set initial active tab based on query parameter if it exists and is valid
  const initialTab = tabParam && ['profile', 'potential-matches', 'match-requests', 'connections', 'collaborations', 'messages', 'connection-requests'].includes(tabParam) 
    ? tabParam as 'profile' | 'potential-matches' | 'match-requests' | 'connections' | 'collaborations' | 'messages' | 'connection-requests'
    : 'profile';
  
  const [activeTab, setActiveTab] = useState<'profile' | 'potential-matches' | 'match-requests' | 'connections' | 'collaborations' | 'messages' | 'connection-requests'>(initialTab);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState<Innovator>(user);
  const [isLoading, setIsLoading] = useState<boolean>(externalLoading || false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [messageStatus, setMessageStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [matches, setMatches] = useState<Innovator[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchPreferences, setMatchPreferences] = useState<Record<string, 'like' | 'dislike'>>({});
  const [preferenceStatus, setPreferenceStatus] = useState<{id: string, status: 'saving' | 'success' | 'error' | null}>({id: '', status: null});
  
  // Add state for connections tab
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  
  // Add state for collaborations tab
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [isLoadingCollaborations, setIsLoadingCollaborations] = useState(false);

  // Add state for messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Add state for connection requests and user's connection status
  const [connectionRequests, setConnectionRequests] = useState<Connection[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [userConnectionStatus, setUserConnectionStatus] = useState<'not_connected' | 'pending' | 'connected'>('not_connected');
  const [connectionsCount, setConnectionsCount] = useState<number>(0);

  // Add state for viewing collaborations with a specific connection
  const [selectedConnection, setSelectedConnection] = useState<any | null>(null);
  const [connectionCollaborations, setConnectionCollaborations] = useState<Collaboration[]>([]);
  const [isLoadingConnectionCollabs, setIsLoadingConnectionCollabs] = useState(false);

  // Check if this is the current user's profile
  const isOwnProfile = currentUser && currentUser.id === user.id;

  const [selectedInnovatorId, setSelectedInnovatorId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Reset activeTab to 'profile' if a non-authenticated user tries to access a protected tab
  useEffect(() => {
    if ((!isAuthenticated || !isOwnProfile) && 
        (activeTab === 'potential-matches' || activeTab === 'match-requests' || 
         activeTab === 'connections' || activeTab === 'collaborations' || 
         activeTab === 'messages' || activeTab === 'connection-requests')) {
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
  
  // Fetch connections when tab changes
  useEffect(() => {
    const fetchConnections = async () => {
      if (activeTab === 'connections' && isAuthenticated && isOwnProfile) {
        setIsLoadingConnections(true);
        try {
          const data = await getUserConnections();
          setConnections(data);
          setConnectionsCount(data.length);
        } catch (error) {
          console.error('Error fetching connections:', error);
        } finally {
          setIsLoadingConnections(false);
        }
      }
    };
    
    fetchConnections();
  }, [activeTab, isAuthenticated, isOwnProfile]);
  
  // Fetch connection requests when tab changes or on component mount
  useEffect(() => {
    const fetchConnectionRequests = async () => {
      if ((activeTab === 'connection-requests' || !isOwnProfile) && isAuthenticated) {
        setIsLoadingRequests(true);
        try {
          const requests = await getConnectionRequests();
          setConnectionRequests(requests);
          
          // Check if viewing another user's profile to determine connection status
          if (!isOwnProfile && currentUser) {
            // Check if there's a pending request from current user to this profile
            const pendingRequest = requests.find(
              req => (req.requesterId === currentUser.id && req.receiverId === user.id) || 
                    (req.receiverId === currentUser.id && req.requesterId === user.id)
            );
            
            if (pendingRequest) {
              if (pendingRequest.status === ConnectionStatus.PENDING) {
                setUserConnectionStatus('pending');
              } else if (pendingRequest.status === ConnectionStatus.ACCEPTED) {
                setUserConnectionStatus('connected');
              }
            } else {
              // Check if they're already connected by fetching connections
              const userConnections = await getUserConnections();
              const isConnected = userConnections.some(conn => conn.user && conn.user.id === user.id);
              if (isConnected) {
                setUserConnectionStatus('connected');
              } else {
                setUserConnectionStatus('not_connected');
              }
            }
          }
        } catch (error) {
          console.error('Error fetching connection requests:', error);
        } finally {
          setIsLoadingRequests(false);
        }
      }
    };
    
    if (isAuthenticated) {
      fetchConnectionRequests();
      
      // Fetch connections count if this is own profile
      if (isOwnProfile) {
        const getConnectionsCount = async () => {
          try {
            const connections = await getUserConnections();
            setConnectionsCount(connections.length);
          } catch (error) {
            console.error('Error fetching connections count:', error);
          }
        };
        
        getConnectionsCount();
      }
    }
  }, [activeTab, isAuthenticated, isOwnProfile, currentUser, user.id]);
  
  // Fetch collaborations when tab changes
  useEffect(() => {
    const fetchCollaborations = async () => {
      if (activeTab === 'collaborations' && isAuthenticated && isOwnProfile) {
        setIsLoadingCollaborations(true);
        try {
          const data = await getUserCollaborations(user.id);
          setCollaborations(data);
        } catch (error) {
          console.error('Error fetching collaborations:', error);
        } finally {
          setIsLoadingCollaborations(false);
        }
      }
    };
    
    fetchCollaborations();
  }, [activeTab, isAuthenticated, isOwnProfile, user.id]);

  // Fetch messages when tab changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (activeTab === 'messages' && isAuthenticated && isOwnProfile) {
        setMessagesLoading(true);
        try {
          const { getConversations } = await import('../services/messages');
          const userConversations = await getConversations();
          setConversations(userConversations);
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setMessagesLoading(false);
        }
      }
    };
    
    fetchMessages();
  }, [activeTab, isAuthenticated, isOwnProfile]);

  // Function to handle connect action
  const handleConnect = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setConnectionStatus('pending');
    setError(null);
    
    try {
      await connectWithUser(profileData.id);
      console.log('Successfully sent connection request to', profileData.name);
      
      // Update connection status
      setUserConnectionStatus('pending');
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

  // Function to handle accepting or rejecting connection requests
  const handleConnectionResponse = async (connectionId: string, action: 'accept' | 'reject') => {
    setIsLoadingRequests(true);
    
    try {
      await respondToConnectionRequest(connectionId, action);
      
      // Update the connection requests list
      setConnectionRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === connectionId 
            ? { ...request, status: action === 'accept' ? ConnectionStatus.ACCEPTED : ConnectionStatus.REJECTED } 
            : request
        )
      );
      
      // If on this user's profile, update the connection status
      if (!isOwnProfile) {
        setUserConnectionStatus(action === 'accept' ? 'connected' : 'not_connected');
      }
      
      // Refresh connections if accepting
      if (action === 'accept') {
        const updatedConnections = await getUserConnections();
        setConnections(updatedConnections);
        setConnectionsCount(updatedConnections.length);
      }
    } catch (error) {
      console.error(`Error ${action}ing connection request:`, error);
    } finally {
      setIsLoadingRequests(false);
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
    setSelectedInnovatorId(innovatorId);
    setIsProfileModalOpen(true);
  };

  // Function to handle viewing collaborations with a specific connection
  const handleViewConnectionCollaborations = async (connection: any) => {
    setSelectedConnection(connection);
    setIsLoadingConnectionCollabs(true);
    
    try {
      // Get collaborations between current user and selected connection
      const collaborations = await getUserCollaborations(user.id);
      const connectionUserId = connection.user?.id || connection.id;
      
      // Filter to find collaborations where this user is a participant
      const sharedCollabs = collaborations.filter((collab: Collaboration) => 
        collab.participants.some((participant: any) => 
          participant === connectionUserId || 
          (typeof participant === 'object' && participant.id === connectionUserId)
        )
      );
      
      setConnectionCollaborations(sharedCollabs);
    } catch (error) {
      console.error('Error fetching shared collaborations:', error);
    } finally {
      setIsLoadingConnectionCollabs(false);
    }
  };

  // Function to go back to connections list
  const handleBackToConnections = () => {
    setSelectedConnection(null);
    setConnectionCollaborations([]);
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
                {profileData.expertise && profileData.expertise.map((skill, index) => (
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
                  {profileData.email || `contact@${profileData.organization?.toLowerCase().replace(/\s+/g, '')}.com`}
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
    console.log('Match results in ProfilePage:', matchResults);

    // Filter out invalid matches (with undefined or NaN scores)
    const validMatches = matchResults.filter(match => 
      typeof match.matchScore === 'number' && !isNaN(match.matchScore)
    );

    // Sort matches: liked profiles at the top, then others (excluding disliked)
    const sortedMatches = validMatches
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
            {sortedMatches.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {sortedMatches.map((match) => (
                  <li key={match.innovator.id} className="px-6 py-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          {match.innovator.type === 'startup' ? (
                            <Briefcase className="h-6 w-6 text-indigo-600" />
                          ) : match.innovator.type === 'research' ? (
                            <Award className="h-6 w-6 text-purple-600" />
                          ) : match.innovator.type === 'investor' ? (
                            <DollarSign className="h-6 w-6 text-green-600" />
                          ) : match.innovator.type === 'accelerator' ? (
                            <Rocket className="h-6 w-6 text-orange-600" />
                          ) : match.innovator.type === 'incubator' ? (
                            <Home className="h-6 w-6 text-blue-600" />
                          ) : (
                            <User className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-medium text-gray-900">{match.innovator.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{match.innovator.type}</div>
                          <div className="text-xs text-gray-500">{match.innovator.organization || ''}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-600">{match.matchScore}% Match</span>
                      </div>
                    </div>
                    
                    {/* Highlight section */}
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-md">
                      <p className="text-sm flex items-start">
                        <Zap className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{match.highlight || `Located in ${match.innovator.location || 'the same region'} with complementary expertise.`}</span>
                      </p>
                    </div>

                    {/* Tags section */}
                    {match.sharedTags && match.sharedTags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {match.sharedTags.slice(0, 5).map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex justify-between items-center">
                      <button 
                        onClick={() => handleMatchPreference(match.innovator.id, 'like')}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                          matchPreferences[match.innovator.id] === 'like' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <ThumbsUp className={`h-4 w-4 mr-1 ${matchPreferences[match.innovator.id] === 'like' ? 'text-green-600' : 'text-gray-400'}`} />
                        {matchPreferences[match.innovator.id] === 'like' ? 'Liked' : 'Like'}
                      </button>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewProfile(match.innovator.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4 mr-1 text-gray-400" />
                          View Profile
                        </button>
                        
                        <button 
                          onClick={() => handleMatchPreference(match.innovator.id, 'dislike')}
                          className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                            matchPreferences[match.innovator.id] === 'dislike' 
                              ? 'bg-red-100 text-red-800 border-red-200' 
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <ThumbsDown className={`h-4 w-4 mr-1 ${matchPreferences[match.innovator.id] === 'dislike' ? 'text-red-600' : 'text-gray-400'}`} />
                          {matchPreferences[match.innovator.id] === 'dislike' ? 'Disliked' : 'Dislike'}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-12 px-4 text-center">
                <UserX className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-base font-medium text-gray-900">No matches found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  We couldn't find any suitable matches based on your profile information.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleEditProfile}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Complete Your Profile
                  </button>
                </div>
              </div>
            )}
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

  // Function to render connections tab content
  const renderConnectionsContent = () => {
    if (isLoadingConnections) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    // If a connection is selected, show their collaborations
    if (selectedConnection) {
      return (
        <div className="space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Collaborations with {selectedConnection.name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Projects and initiatives you're working on together.
                </p>
              </div>
              <button
                onClick={handleBackToConnections}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Connections
              </button>
            </div>
            <div className="border-t border-gray-200">
              {isLoadingConnectionCollabs ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : connectionCollaborations.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {connectionCollaborations.map((collab) => (
                    <li key={collab.id} className="px-6 py-4 hover:bg-gray-50">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{collab.title}</div>
                        <div className="text-sm text-gray-500 capitalize">{collab.type}</div>
                        <div className="mt-2 text-sm text-gray-500">
                          {collab.description.length > 100 
                            ? `${collab.description.substring(0, 100)}...` 
                            : collab.description}
                        </div>
                        <div className="mt-2 flex">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            collab.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : collab.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {collab.status.charAt(0).toUpperCase() + collab.status.slice(1)}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            Started: {new Date(collab.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-12 sm:px-6 text-center">
                  <div className="text-gray-500">
                    <p>You don't have any collaborations with {selectedConnection.name} yet.</p>
                    <p className="mt-1 text-sm">Start a new project together by creating a challenge or partnership.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Connections</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              People and organizations you've connected with on the platform.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {connections.length > 0 ? (
                connections.map((connection) => {
                  // Ensure we have user data
                  if (!connection.user) {
                    console.error("Missing user data in connection:", connection);
                    return null;
                  }
                  
                  return (
                    <li key={connection.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                            {connection.user.profilePicture ? (
                              <img 
                                src={connection.user.profilePicture} 
                                alt={`${connection.user.firstName} ${connection.user.lastName}`} 
                                className="h-full w-full object-cover"
                              />
                            ) : connection.user.role === 'startup' ? (
                              <Briefcase className="h-5 w-5 text-indigo-600" />
                            ) : connection.user.role === 'research' ? (
                              <Award className="h-5 w-5 text-purple-600" />
                            ) : (
                              <User className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {connection.user.firstName} {connection.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {connection.user.role} {connection.user.organization ? `at ${connection.user.organization}` : ''}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewConnectionCollaborations(connection)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                          >
                            View Collaborations
                          </button>
                          <Link
                            to={`/profile/${connection.user.id}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                          >
                            View Profile
                          </Link>
                          <Link
                            to={`/messages/${connection.user.id}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                          >
                            Message
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })
              ) : (
                <li className="px-4 py-12 sm:px-6 text-center">
                  <div className="text-gray-500">
                    <p>You don't have any connections yet.</p>
                    <p className="mt-1 text-sm">Browse the innovators list to find people to connect with.</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Function to render collaborations tab content
  const renderCollaborationsContent = () => {
    if (isLoadingCollaborations) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Collaborations</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Challenges, partnerships, and ideas you've created or participated in.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {collaborations.length > 0 ? (
                collaborations.map((collaboration) => (
                  <li key={collaboration.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{collaboration.title}</div>
                        <div className="text-sm text-gray-500 capitalize">{collaboration.type}</div>
                        <div className="mt-1 text-sm text-gray-500">
                          {collaboration.description.length > 100 
                            ? `${collaboration.description.substring(0, 100)}...` 
                            : collaboration.description}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          collaboration.status === 'active' ? 'bg-green-100 text-green-800' :
                          collaboration.status === 'proposed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {collaboration.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Link
                        to={`/collaboration/${collaboration.id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                      >
                        View Details
                      </Link>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-12 sm:px-6 text-center">
                  <div className="text-gray-500">
                    <p>You don't have any collaborations yet.</p>
                    <p className="mt-1 text-sm">Create a challenge, partnership, or idea to get started.</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Function to render messages content
  const renderMessagesContent = () => {
    if (messagesLoading) {
      return (
        <div className="py-10 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      );
    }

    if (conversations.length === 0) {
      return (
        <div className="py-12 px-4 text-center bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="bg-indigo-50 mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-4">
            <MessageSquare className="h-8 w-8 text-indigo-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Your messages will appear here</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Connect with other innovators and start messaging to build your network.
          </p>
          <Link
            to="/connections"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Find Connections
          </Link>
        </div>
      );
    }
    
    // Check if there's a welcome message
    const welcomeMessage = conversations.find(conv => 
      conv.user.email === 'system@t3awanu.com' || 
      conv.user.firstName === 'T3awanu'
    );
    
    return (
      <div className="space-y-4">
        {/* Welcome Message Card (if exists) */}
        {welcomeMessage && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg shadow-sm p-4 mb-6 border border-indigo-100">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-medium text-gray-900">
                    Welcome to T3awanu
                  </h4>
                  <span className="text-xs text-gray-500">
                    {new Date(welcomeMessage.latestMessage.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mt-1">
                  {welcomeMessage.latestMessage.content}
                </p>
                
                <div className="mt-3">
                  <Link
                    to={`/messages/${welcomeMessage.userId}`}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    View Message
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Conversations List */}
        <div className="divide-y divide-gray-200 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium p-4 border-b border-gray-200">Recent Conversations</h3>
          {conversations
            .filter(conv => conv.user.email !== 'system@t3awanu.com' && conv.user.firstName !== 'T3awanu')
            .map((conversation) => {
              const { userId, user, latestMessage, unreadCount } = conversation;
              const isUnread = unreadCount > 0;
              
              return (
                <div 
                  key={userId} 
                  className={`p-4 hover:bg-gray-50 transition-colors ${isUnread ? 'bg-indigo-50' : ''}`}
                  onClick={() => {
                    // Navigate to the full conversation view
                    navigate(`/messages/${userId}`);
                  }}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt={`${user.firstName} ${user.lastName}`} 
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-indigo-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {user.firstName} {user.lastName}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(latestMessage.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className={`text-sm truncate ${isUnread ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                        {latestMessage.content}
                      </p>
                      
                      {isUnread && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {conversations.filter(conv => 
              conv.user.email !== 'system@t3awanu.com' && 
              conv.user.firstName !== 'T3awanu'
            ).length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500">No conversations with other users yet</p>
              </div>
            )}
        </div>
      </div>
    );
  };

  // Function to render connection requests tab content
  const renderConnectionRequestsContent = () => {
    if (isLoadingRequests) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    const pendingRequests = connectionRequests.filter(
      request => request.status === ConnectionStatus.PENDING
    );
    
    return (
      <div className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Connection Requests</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              People who want to connect with you. Accept or reject connection requests.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <li key={request.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          {request.requester?.role === 'startup' ? (
                            <Briefcase className="h-5 w-5 text-indigo-600" />
                          ) : request.requester?.role === 'research' ? (
                            <Award className="h-5 w-5 text-purple-600" />
                          ) : (
                            <User className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.requester?.firstName} {request.requester?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">{request.requester?.role}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleConnectionResponse(request.id, 'accept')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleConnectionResponse(request.id, 'reject')}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <X className="mr-1 h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-12 sm:px-6 text-center">
                  <div className="text-gray-500">
                    <p>You don't have any pending connection requests.</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Function to render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileContent();
      case 'potential-matches':
        return renderPotentialMatchesContent();
      case 'match-requests':
        return renderMatchRequestsContent();
      case 'connections':
        return renderConnectionsContent();
      case 'collaborations':
        return renderCollaborationsContent();
      case 'messages':
        return renderMessagesContent();
      case 'connection-requests':
        return renderConnectionRequestsContent();
      default:
        return renderProfileContent();
    }
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
    <div className="container mx-auto px-4 py-8">
      {/* Back button if needed */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </button>
      )}
      
      {/* Profile header */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="flex-shrink-0 h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
              {profileData.type === 'startup' ? (
                <Briefcase className="h-10 w-10 text-indigo-600" />
              ) : profileData.type === 'investor' ? (
                <DollarSign className="h-10 w-10 text-green-600" />
              ) : profileData.type === 'research' ? (
                <Award className="h-10 w-10 text-purple-600" />
              ) : profileData.type === 'individual' ? (
                <User className="h-10 w-10 text-blue-600" />
              ) : profileData.type === 'accelerator' || profileData.type === 'incubator' ? (
                <Zap className="h-10 w-10 text-yellow-600" />
              ) : (
                <Building className="h-10 w-10 text-gray-600" />
              )}
            </div>
            
            <div className="md:ml-5 mt-3 md:mt-0">
              <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
              <div className="flex flex-wrap items-center mt-1">
                <span className="capitalize bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded">
                  {profileData.type}
                </span>
                
                {profileData.position && (
                  <span className="ml-2 text-gray-600 text-sm">
                    {profileData.position}
                  </span>
                )}
                
                {profileData.organization && profileData.type !== 'startup' && (
                  <span className="ml-2 text-gray-600 text-sm">
                    at {profileData.organization}
                  </span>
                )}
                
                {!isOwnProfile && (
                  <span className={`ml-2 text-sm px-2 py-1 rounded-full ${
                    userConnectionStatus === 'connected' 
                      ? 'bg-green-100 text-green-800' 
                      : userConnectionStatus === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {userConnectionStatus === 'connected' 
                      ? 'Connected' 
                      : userConnectionStatus === 'pending' 
                        ? 'Connection Pending'
                        : 'Not Connected'}
                  </span>
                )}
                
                {isOwnProfile && (
                  <span className="ml-2 text-gray-600 text-sm flex items-center">
                    <Users className="h-4 w-4 mr-1" /> {connectionsCount} connection{connectionsCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {isOwnProfile && (
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </button>
          )}
          
          {!isOwnProfile && isAuthenticated && (
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button
                onClick={handleConnect}
                disabled={isLoading || connectionStatus === 'pending' || userConnectionStatus === 'connected' || userConnectionStatus === 'pending'}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                  userConnectionStatus === 'connected' 
                    ? 'text-green-700 bg-green-100 cursor-default'
                    : userConnectionStatus === 'pending'
                      ? 'text-yellow-700 bg-yellow-100 cursor-default'
                      : 'text-white bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {connectionStatus === 'pending' ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Connecting...
                  </>
                ) : userConnectionStatus === 'connected' ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Connected
                  </>
                ) : userConnectionStatus === 'pending' ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Request Pending
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Connect
                  </>
                )}
              </button>
              
              <button
                onClick={handleMessage}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile
          </button>
          
          {isAuthenticated && isOwnProfile && (
            <>
              <button
                onClick={() => setActiveTab('potential-matches')}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'potential-matches'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Matches
              </button>
              
              <button
                onClick={() => setActiveTab('match-requests')}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'match-requests'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Match Requests
              </button>
              
              <button
                onClick={() => setActiveTab('connections')}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'connections'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Connections {connectionsCount > 0 && `(${connectionsCount})`}
              </button>
              
              <button
                onClick={() => setActiveTab('connection-requests')}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'connection-requests'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Connection Requests {connectionRequests.filter(req => req.status === ConnectionStatus.PENDING && req.receiverId === currentUser?.id).length > 0 && 
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                    {connectionRequests.filter(req => req.status === ConnectionStatus.PENDING && req.receiverId === currentUser?.id).length}
                  </span>}
              </button>
              
              <button
                onClick={() => setActiveTab('collaborations')}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'collaborations'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Collaborations
              </button>
              
              <button
                onClick={() => setActiveTab('messages')}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'messages'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Messages
              </button>
            </>
          )}
        </nav>
      </div>
      
      {/* Tab Content */}
      {renderTabContent()}
      
      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={profileData}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}
      
      {/* Message Modal */}
      {showMessageModal && MessageModal()}

      {/* User Profile Modal */}
      {selectedInnovatorId && (
        <UserProfileModal
          userId={selectedInnovatorId}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
}