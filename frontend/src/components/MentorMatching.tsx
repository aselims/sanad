import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Award,
  Calendar,
  MessageCircle,
  ExternalLink,
  CheckCircle,
  Plus,
  User,
  Briefcase,
  Target
} from 'lucide-react';
import {
  searchMentors,
  getMentorProfile,
  requestSession,
  createMentorProfile,
  Mentor,
  SearchMentorsParams,
  RequestSessionRequest,
  CreateMentorProfileRequest
} from '../services/mentors';
import { getUserProjects, Project } from '../services/projects';
import { useAuth } from '../contexts/AuthContext';

const MentorCard: React.FC<{ 
  mentor: Mentor; 
  onSelect: (mentor: Mentor) => void; 
  onRequestSession: (mentor: Mentor) => void;
}> = ({ mentor, onSelect, onRequestSession }) => {
  const getExpertiseLevelColor = (level: string) => {
    switch (level) {
      case 'senior': return 'bg-blue-100 text-blue-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'specialist': return 'bg-green-100 text-green-800';
      case 'thought_leader': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isAvailable = mentor.currentMentees < mentor.maxMentees && mentor.status === 'active';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">
              {mentor.user?.firstName?.[0] || 'M'}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg text-gray-900">
                {mentor.user?.firstName} {mentor.user?.lastName}
              </h3>
              {mentor.isVerified && (
                <CheckCircle className="h-5 w-5 text-blue-600" />
              )}
            </div>
            {mentor.jobTitle && mentor.companyName && (
              <p className="text-gray-600 text-sm">
                {mentor.jobTitle} at {mentor.companyName}
              </p>
            )}
            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <Award className="h-3 w-3" />
                <span>{mentor.yearsOfExperience} years</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{mentor.timezone}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpertiseLevelColor(mentor.expertiseLevel)}`}>
            {mentor.expertiseLevel.replace('_', ' ')}
          </span>
          {mentor.averageRating && (
            <div className="flex items-center space-x-1 mt-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{mentor.averageRating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({mentor.totalReviews})</span>
            </div>
          )}
        </div>
      </div>

      {mentor.bio && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{mentor.bio}</p>
      )}

      <div className="space-y-3 mb-4">
        {/* Industry Focus */}
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">Industry Focus:</p>
          <div className="flex flex-wrap gap-1">
            {mentor.industryFocus.slice(0, 3).map((industry, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {industry}
              </span>
            ))}
            {mentor.industryFocus.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{mentor.industryFocus.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Functional Expertise */}
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">Expertise:</p>
          <div className="flex flex-wrap gap-1">
            {mentor.functionalExpertise.slice(0, 3).map((expertise, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                {expertise}
              </span>
            ))}
            {mentor.functionalExpertise.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{mentor.functionalExpertise.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{mentor.currentMentees}/{mentor.maxMentees}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{mentor.sessionDurationMinutes}min sessions</span>
          </span>
          {mentor.isPaidMentoring && mentor.hourlyRate && (
            <span className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>${mentor.hourlyRate}/hr</span>
            </span>
          )}
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onSelect(mentor)}
          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
        >
          View Profile
        </button>
        <button
          onClick={() => onRequestSession(mentor)}
          disabled={!isAvailable}
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Request Session
        </button>
      </div>
    </div>
  );
};

const BecomeMentorForm: React.FC<{
  onSubmit: (data: CreateMentorProfileRequest) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateMentorProfileRequest>({
    yearsOfExperience: 0,
    industryFocus: [],
    functionalExpertise: [],
    stagePreference: [],
    availableDays: [],
    availableTimeSlots: []
  });

  const [skillInput, setSkillInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addSkill = (type: 'industry' | 'expertise') => {
    const input = type === 'industry' ? industryInput : skillInput;
    if (!input.trim()) return;

    const updatedFormData = { ...formData };
    if (type === 'industry') {
      updatedFormData.industryFocus = [...formData.industryFocus, input.trim()];
      setIndustryInput('');
    } else {
      updatedFormData.functionalExpertise = [...formData.functionalExpertise, input.trim()];
      setSkillInput('');
    }
    
    setFormData(updatedFormData);
  };

  const removeItem = (type: 'industry' | 'expertise' | 'stage', index: number) => {
    const updatedFormData = { ...formData };
    if (type === 'industry') {
      updatedFormData.industryFocus = formData.industryFocus.filter((_, i) => i !== index);
    } else if (type === 'expertise') {
      updatedFormData.functionalExpertise = formData.functionalExpertise.filter((_, i) => i !== index);
    } else {
      updatedFormData.stagePreference = formData.stagePreference.filter((_, i) => i !== index);
    }
    setFormData(updatedFormData);
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00',
    '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={formData.companyName || ''}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title
          </label>
          <input
            type="text"
            value={formData.jobTitle || ''}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience *
          </label>
          <input
            type="number"
            value={formData.yearsOfExperience}
            onChange={(e) => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
            min={0}
            max={50}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expertise Level
          </label>
          <select
            value={formData.expertiseLevel || 'senior'}
            onChange={(e) => setFormData({ ...formData, expertiseLevel: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="senior">Senior</option>
            <option value="expert">Expert</option>
            <option value="specialist">Specialist</option>
            <option value="thought_leader">Thought Leader</option>
          </select>
        </div>
      </div>

      {/* Industry Focus */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Industry Focus *
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={industryInput}
            onChange={(e) => setIndustryInput(e.target.value)}
            placeholder="Enter an industry..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('industry'))}
          />
          <button
            type="button"
            onClick={() => addSkill('industry')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.industryFocus.map((industry, index) => (
            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-1">
              <span>{industry}</span>
              <button
                type="button"
                onClick={() => removeItem('industry', index)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Functional Expertise */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Functional Expertise *
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Enter expertise area..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('expertise'))}
          />
          <button
            type="button"
            onClick={() => addSkill('expertise')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.functionalExpertise.map((expertise, index) => (
            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center space-x-1">
              <span>{expertise}</span>
              <button
                type="button"
                onClick={() => removeItem('expertise', index)}
                className="text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Available Days */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Days *
        </label>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <label key={day} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.availableDays.includes(day.toLowerCase())}
                onChange={(e) => {
                  const dayLower = day.toLowerCase();
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      availableDays: [...formData.availableDays, dayLower]
                    });
                  } else {
                    setFormData({
                      ...formData,
                      availableDays: formData.availableDays.filter(d => d !== dayLower)
                    });
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{day.slice(0, 3)}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio || ''}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Tell potential mentees about yourself..."
        />
      </div>

      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            formData.yearsOfExperience === 0 ||
            formData.industryFocus.length === 0 ||
            formData.functionalExpertise.length === 0 ||
            formData.availableDays.length === 0
          }
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Create Profile
        </button>
      </div>
    </form>
  );
};

export const MentorMatching: React.FC = () => {
  const navigate = useNavigate();
  const { mentorId } = useParams<{ mentorId?: string }>();
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBecomeMentorForm, setShowBecomeMentorForm] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchMentorsParams>({});

  useEffect(() => {
    fetchMentors();
    fetchProjects();
  }, [searchParams]);

  const fetchMentors = async () => {
    try {
      const { mentors: fetchedMentors } = await searchMentors({
        ...searchParams,
        limit: 20
      });
      setMentors(fetchedMentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { projects: fetchedProjects } = await getUserProjects({ limit: 50 });
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCreateMentorProfile = async (profileData: CreateMentorProfileRequest) => {
    try {
      await createMentorProfile(profileData);
      setShowBecomeMentorForm(false);
      // Refresh mentors list
      await fetchMentors();
    } catch (error) {
      console.error('Error creating mentor profile:', error);
    }
  };

  const handleRequestSession = async (mentor: Mentor) => {
    // This would open a session request modal
    console.log('Request session with:', mentor);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showBecomeMentorForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Become a Mentor</h1>
          <BecomeMentorForm
            onSubmit={handleCreateMentorProfile}
            onCancel={() => setShowBecomeMentorForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Mentors</h1>
          <p className="text-gray-600 mt-2">Connect with experienced mentors to accelerate your journey</p>
        </div>
        <button
          onClick={() => setShowBecomeMentorForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Become a Mentor</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <select
            value={searchParams.expertiseLevel || ''}
            onChange={(e) => setSearchParams({ ...searchParams, expertiseLevel: e.target.value || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            <option value="senior">Senior</option>
            <option value="expert">Expert</option>
            <option value="specialist">Specialist</option>
            <option value="thought_leader">Thought Leader</option>
          </select>

          <select
            value={searchParams.isPaidMentoring?.toString() || ''}
            onChange={(e) => setSearchParams({ 
              ...searchParams, 
              isPaidMentoring: e.target.value ? e.target.value === 'true' : undefined 
            })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Free & Paid</option>
            <option value="false">Free Only</option>
            <option value="true">Paid Only</option>
          </select>

          <select
            value={searchParams.isVerified?.toString() || ''}
            onChange={(e) => setSearchParams({ 
              ...searchParams, 
              isVerified: e.target.value ? e.target.value === 'true' : undefined 
            })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Mentors</option>
            <option value="true">Verified Only</option>
          </select>

          <input
            type="number"
            placeholder="Max hourly rate"
            value={searchParams.maxHourlyRate || ''}
            onChange={(e) => setSearchParams({ 
              ...searchParams, 
              maxHourlyRate: e.target.value ? Number(e.target.value) : undefined 
            })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => setSearchParams({})}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Mentors Grid */}
      {mentors.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or become the first mentor in your area.
            </p>
            <button
              onClick={() => setShowBecomeMentorForm(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Become a Mentor
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              onSelect={setSelectedMentor}
              onRequestSession={handleRequestSession}
            />
          ))}
        </div>
      )}
    </div>
  );
};