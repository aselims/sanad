import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  MapPin,
  Star,
  Clock,
  Briefcase,
  CheckCircle,
  X,
  Send,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CoFounder {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  bio: string;
  organization: string;
  position: string;
  location: string;
  experienceLevel: string;
  skills: Array<{
    skillName: string;
    proficiencyLevel: number;
    yearsExperience: number;
  }>;
  preferredIndustries: string[];
  preferredCompanyStages: string[];
  isVerified: boolean;
  profilePicture: string;
}

interface TeamInvitation {
  id: string;
  fromUserId: string;
  toUserId: string;
  ideaId?: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  invitationType: string;
  createdAt: string;
  fromUserName: string;
  toUserName: string;
  ideaTitle?: string;
}

interface SearchFilters {
  requiredSkills: string[];
  industryPreferences: string[];
  experienceLevel: string;
  availabilityStatus: string;
}

const experienceLevels = [
  { value: '', label: 'Any Experience' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'expert', label: 'Expert' },
];

const industries = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Environment',
  'Social Impact',
  'E-commerce',
  'Manufacturing',
  'Energy',
  'Transportation',
  'Food & Agriculture',
  'Entertainment',
];

const commonSkills = [
  'Business Development',
  'Marketing',
  'Sales',
  'Product Management',
  'Software Engineering',
  'Design (UI/UX)',
  'Data Analysis',
  'Finance',
  'Operations',
  'Strategy',
  'Leadership',
  'Fundraising',
];

export const CoFounderSearch: React.FC = () => {
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState<CoFounder[]>([]);
  const [myInvitations, setMyInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [selectedCoFounder, setSelectedCoFounder] = useState<CoFounder | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  
  const [filters, setFilters] = useState<SearchFilters>({
    requiredSkills: [],
    industryPreferences: [],
    experienceLevel: '',
    availabilityStatus: 'available',
  });

  useEffect(() => {
    searchCoFounders();
    loadMyInvitations();
  }, []);

  const searchCoFounders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (filters.requiredSkills.length > 0) {
        filters.requiredSkills.forEach(skill => params.append('requiredSkills', skill));
      }
      if (filters.industryPreferences.length > 0) {
        filters.industryPreferences.forEach(industry => params.append('industryPreferences', industry));
      }
      if (filters.experienceLevel) {
        params.append('experienceLevel', filters.experienceLevel);
      }
      if (filters.availabilityStatus) {
        params.append('availabilityStatus', filters.availabilityStatus);
      }

      const response = await fetch(`/api/team-invitations/search/co-founders?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.coFounders || []);
      }
    } catch (error) {
      console.error('Error searching co-founders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyInvitations = async () => {
    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        fetch('/api/team-invitations?type=sent', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/team-invitations?type=received', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      const [sentData, receivedData] = await Promise.all([
        sentResponse.ok ? sentResponse.json() : { invitations: [] },
        receivedResponse.ok ? receivedResponse.json() : { invitations: [] },
      ]);

      setMyInvitations([...sentData.invitations, ...receivedData.invitations]);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const sendInvitation = async () => {
    if (!selectedCoFounder || !inviteMessage.trim()) return;

    try {
      const response = await fetch('/api/team-invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          toUserId: selectedCoFounder.id,
          invitationType: 'co_founder',
          message: inviteMessage,
          expiresInDays: 14,
        }),
      });

      if (response.ok) {
        setShowInviteModal(false);
        setInviteMessage('');
        setSelectedCoFounder(null);
        loadMyInvitations(); // Refresh invitations
        alert('Invitation sent successfully!');
      } else {
        alert('Failed to send invitation. Please try again.');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    }
  };

  const respondToInvitation = async (invitationId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/team-invitations/${invitationId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        loadMyInvitations(); // Refresh invitations
        alert(`Invitation ${action}ed successfully!`);
      } else {
        alert(`Failed to ${action} invitation. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${action}ing invitation:`, error);
      alert(`Failed to ${action} invitation. Please try again.`);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleSkillFilter = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...prev.requiredSkills, skill]
    }));
  };

  const toggleIndustryFilter = (industry: string) => {
    setFilters(prev => ({
      ...prev,
      industryPreferences: prev.industryPreferences.includes(industry)
        ? prev.industryPreferences.filter(i => i !== industry)
        : [...prev.industryPreferences, industry]
    }));
  };

  const renderFilters = () => (
    <div className="bg-white border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Search Filters</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-blue-600 hover:text-blue-700"
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {showFilters && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {commonSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkillFilter(skill)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    filters.requiredSkills.includes(skill)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => toggleIndustryFilter(industry)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    filters.industryPreferences.includes(industry)
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={filters.experienceLevel}
                onChange={(e) => updateFilter('experienceLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {experienceLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <select
                value={filters.availabilityStatus}
                onChange={(e) => updateFilter('availabilityStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="not_available">Not Available</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={searchCoFounders}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Co-founders
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderCoFounderCard = (coFounder: CoFounder) => (
    <div key={coFounder.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {coFounder.profilePicture ? (
            <img
              src={coFounder.profilePicture}
              alt={`${coFounder.firstName} ${coFounder.lastName}`}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-semibold">
                {coFounder.firstName[0]}{coFounder.lastName[0]}
              </span>
            </div>
          )}
          <div className="ml-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              {coFounder.firstName} {coFounder.lastName}
              {coFounder.isVerified && (
                <CheckCircle className="w-4 h-4 text-blue-500 ml-1" />
              )}
            </h3>
            <p className="text-gray-600 text-sm">{coFounder.position} at {coFounder.organization}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedCoFounder(coFounder);
              setShowInviteModal(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Send invitation"
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            title="View profile"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-3">{coFounder.bio}</p>

      <div className="space-y-3">
        {coFounder.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {coFounder.location}
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <Briefcase className="w-4 h-4 mr-2" />
          {coFounder.experienceLevel} level • {coFounder.role}
        </div>

        {coFounder.skills && coFounder.skills.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Top Skills:</p>
            <div className="flex flex-wrap gap-1">
              {coFounder.skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center"
                >
                  {skill.skillName}
                  <div className="ml-1 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-2 h-2 ${
                          i < skill.proficiencyLevel ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </span>
              ))}
              {coFounder.skills.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{coFounder.skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {coFounder.preferredIndustries && coFounder.preferredIndustries.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Interested in:</p>
            <div className="flex flex-wrap gap-1">
              {coFounder.preferredIndustries.slice(0, 3).map((industry, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {industry}
                </span>
              ))}
              {coFounder.preferredIndustries.length > 3 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  +{coFounder.preferredIndustries.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderInviteModal = () => {
    if (!showInviteModal || !selectedCoFounder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Send Co-founder Invitation</h3>
            <button
              onClick={() => setShowInviteModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Sending invitation to <strong>{selectedCoFounder.firstName} {selectedCoFounder.lastName}</strong>
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message *
            </label>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Hi there! I'd love to explore the possibility of working together as co-founders. I think our skills would complement each other well..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowInviteModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={sendInvitation}
              disabled={!inviteMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Invitation
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderInvitations = () => (
    <div className="bg-white border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">My Invitations</h3>
        <button
          onClick={() => setShowInvitations(!showInvitations)}
          className="text-blue-600 hover:text-blue-700"
        >
          {showInvitations ? 'Hide' : 'Show'} ({myInvitations.length})
        </button>
      </div>

      {showInvitations && (
        <div className="space-y-4">
          {myInvitations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No invitations yet</p>
          ) : (
            myInvitations.map((invitation) => (
              <div key={invitation.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">
                      {invitation.fromUserId === user?.id ? (
                        <>Sent to {invitation.toUserName}</>
                      ) : (
                        <>From {invitation.fromUserName}</>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(invitation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      invitation.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : invitation.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {invitation.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{invitation.message}</p>
                {invitation.status === 'pending' && invitation.fromUserId !== user?.id && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => respondToInvitation(invitation.id, 'accept')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respondToInvitation(invitation.id, 'reject')}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Co-founders</h1>
        <p className="text-gray-600">
          Connect with potential co-founders who complement your skills and share your vision.
        </p>
      </div>

      {renderInvitations()}
      {renderFilters()}

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Potential Co-founders ({searchResults.length})
          </h2>
          {isLoading && (
            <div className="flex items-center text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              Searching...
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {searchResults.map((coFounder) => renderCoFounderCard(coFounder))}
      </div>

      {!isLoading && searchResults.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No co-founders found</h3>
          <p className="text-gray-600">
            Try adjusting your search filters to find more potential co-founders.
          </p>
        </div>
      )}

      {renderInviteModal()}
    </div>
  );
};