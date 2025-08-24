import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  UserPlus,
  Crown,
  Star,
  Mail,
  MapPin,
  Clock,
  Award,
  Settings,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  createTeam,
  getUserTeams,
  getTeam,
  inviteToTeam,
  respondToInvitation,
  searchPotentialMembers,
  Team,
  TeamMember,
  CreateTeamRequest,
  SearchMembersParams
} from '../services/teams';
import { getUserProjects, Project } from '../services/projects';
import { useAuth } from '../contexts/AuthContext';

const TeamMemberCard: React.FC<{
  member: TeamMember;
  isLead?: boolean;
  canManage?: boolean;
  onRemove?: (memberId: string) => void;
  onUpdateRole?: (memberId: string, role: string) => void;
}> = ({ member, isLead, canManage, onRemove, onUpdateRole }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'founder': return 'bg-purple-100 text-purple-800';
      case 'co_founder': return 'bg-blue-100 text-blue-800';
      case 'team_lead': return 'bg-green-100 text-green-800';
      case 'developer': return 'bg-cyan-100 text-cyan-800';
      case 'designer': return 'bg-pink-100 text-pink-800';
      case 'marketer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'invited': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {member.user?.firstName?.[0] || 'U'}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {member.user?.firstName} {member.user?.lastName}
              {isLead && <Crown className="inline ml-2 h-4 w-4 text-yellow-500" />}
            </h4>
            <p className="text-sm text-gray-600">{member.user?.position || 'No position'}</p>
          </div>
        </div>
        
        {canManage && member.role !== 'founder' && member.role !== 'team_lead' && (
          <button
            onClick={() => onRemove?.(member.id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
          {member.role.replace('_', ' ')}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
          {member.status}
        </span>
      </div>

      {member.responsibilities && member.responsibilities.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-1">Responsibilities:</p>
          <div className="flex flex-wrap gap-1">
            {member.responsibilities.slice(0, 3).map((responsibility, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {responsibility}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
        {member.timeCommitmentHours && (
          <span>{member.timeCommitmentHours}h/week</span>
        )}
      </div>
    </div>
  );
};

const CreateTeamForm: React.FC<{
  onSubmit: (data: CreateTeamRequest) => void;
  onCancel: () => void;
  projects: Project[];
}> = ({ onSubmit, onCancel, projects }) => {
  const [formData, setFormData] = useState<CreateTeamRequest>({
    name: '',
    description: '',
    type: 'project_team',
    maxMembers: 10,
    requiredSkills: [],
    preferredSkills: []
  });

  const [skillInput, setSkillInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addSkill = (skillType: 'required' | 'preferred') => {
    if (!skillInput.trim()) return;
    
    const updatedFormData = { ...formData };
    if (skillType === 'required') {
      updatedFormData.requiredSkills = [...(formData.requiredSkills || []), skillInput.trim()];
    } else {
      updatedFormData.preferredSkills = [...(formData.preferredSkills || []), skillInput.trim()];
    }
    
    setFormData(updatedFormData);
    setSkillInput('');
  };

  const removeSkill = (skillType: 'required' | 'preferred', index: number) => {
    const updatedFormData = { ...formData };
    if (skillType === 'required') {
      updatedFormData.requiredSkills = formData.requiredSkills?.filter((_, i) => i !== index);
    } else {
      updatedFormData.preferredSkills = formData.preferredSkills?.filter((_, i) => i !== index);
    }
    setFormData(updatedFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Team Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="project_team">Project Team</option>
            <option value="core_team">Core Team</option>
            <option value="advisory_board">Advisory Board</option>
            <option value="working_group">Working Group</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Members
          </label>
          <input
            type="number"
            value={formData.maxMembers}
            onChange={(e) => setFormData({ ...formData, maxMembers: Number(e.target.value) })}
            min={2}
            max={50}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {projects.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Associated Project (Optional)
          </label>
          <select
            value={formData.projectId || ''}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Skills Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Skills
        </label>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Enter a skill..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill('required');
              }
            }}
          />
          <button
            type="button"
            onClick={() => addSkill('required')}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
          >
            Required
          </button>
          <button
            type="button"
            onClick={() => addSkill('preferred')}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
          >
            Preferred
          </button>
        </div>

        {(formData.requiredSkills?.length || 0) > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
            <div className="flex flex-wrap gap-2">
              {formData.requiredSkills?.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center space-x-1">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill('required', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {(formData.preferredSkills?.length || 0) > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Preferred Skills:</p>
            <div className="flex flex-wrap gap-2">
              {formData.preferredSkills?.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-1">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill('preferred', index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!formData.name}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Create Team
        </button>
      </div>
    </form>
  );
};

export const TeamFormation: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId?: string }>();
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [potentialMembers, setPotentialMembers] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useState<SearchMembersParams>({});

  useEffect(() => {
    fetchTeams();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (teamId && teams.length > 0) {
      const team = teams.find(t => t.id === teamId);
      setSelectedTeam(team || null);
    }
  }, [teamId, teams]);

  const fetchTeams = async () => {
    try {
      const { teams: fetchedTeams } = await getUserTeams({ limit: 50 });
      setTeams(fetchedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
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

  const handleCreateTeam = async (teamData: CreateTeamRequest) => {
    try {
      const team = await createTeam(teamData);
      setTeams([team, ...teams]);
      setShowCreateForm(false);
      navigate(`/teams/${team.id}`);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleInviteMember = async (userId: string, role: string) => {
    if (!selectedTeam) return;
    
    try {
      await inviteToTeam(selectedTeam.id, { userId, role: role as any });
      // Refresh team data
      const updatedTeam = await getTeam(selectedTeam.id);
      setSelectedTeam(updatedTeam);
      setShowInviteForm(false);
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  const searchMembers = async () => {
    if (!selectedTeam) return;
    
    try {
      const { users } = await searchPotentialMembers(selectedTeam.id, searchParams);
      setPotentialMembers(users);
    } catch (error) {
      console.error('Error searching members:', error);
    }
  };

  const TeamCard: React.FC<{ team: Team }> = ({ team }) => {
    const getTypeColor = (type: string) => {
      switch (type) {
        case 'core_team': return 'bg-purple-100 text-purple-800';
        case 'advisory_board': return 'bg-blue-100 text-blue-800';
        case 'project_team': return 'bg-green-100 text-green-800';
        case 'working_group': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div 
        className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
        onClick={() => navigate(`/teams/${team.id}`)}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lg text-gray-900">{team.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(team.type)}`}>
            {team.type.replace('_', ' ')}
          </span>
        </div>

        {team.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{team.description}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{team.currentMembersCount}/{team.maxMembers}</span>
            </span>
            {team.project && (
              <span className="flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span>{team.project.name}</span>
              </span>
            )}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs ${
            team.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {team.status}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Team</h1>
          <CreateTeamForm
            onSubmit={handleCreateTeam}
            onCancel={() => setShowCreateForm(false)}
            projects={projects}
          />
        </div>
      </div>
    );
  }

  if (selectedTeam) {
    // Team detail view would go here - for now just show basic info
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedTeam.name}</h1>
              {selectedTeam.description && (
                <p className="text-gray-600">{selectedTeam.description}</p>
              )}
            </div>
            <button
              onClick={() => navigate('/teams')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back to Teams
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTeam.members?.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    isLead={member.role === 'team_lead' || member.role === 'founder'}
                    canManage={selectedTeam.teamLeadId === user?.id}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Team Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Members:</span>
                    <span>{selectedTeam.currentMembersCount}/{selectedTeam.maxMembers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="capitalize">{selectedTeam.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="capitalize">{selectedTeam.type.replace('_', ' ')}</span>
                  </div>
                </div>
                
                {selectedTeam.teamLeadId === user?.id && (
                  <button
                    onClick={() => setShowInviteForm(true)}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Invite Member</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600 mt-2">Form and manage your project teams</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Team</span>
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first team to start collaborating on projects.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Team</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
};