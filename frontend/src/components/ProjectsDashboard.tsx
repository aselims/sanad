import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { 
  getUserProjects, 
  getProjectStats, 
  Project, 
  ProjectStats 
} from '../services/projects';
import { useAuth } from '../contexts/AuthContext';

const ProjectCard: React.FC<{ project: Project; onSelect: (project: Project) => void }> = ({ 
  project, 
  onSelect 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'development': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mvp': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'growth': return 'bg-green-100 text-green-800 border-green-200';
      case 'mature': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'pre_seed': return 'bg-orange-100 text-orange-800';
      case 'seed': return 'bg-yellow-100 text-yellow-800';
      case 'series_a': return 'bg-blue-100 text-blue-800';
      case 'series_b': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(project)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{project.name}</h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{project.description}</p>
          </div>
          {project.sourceIdea && (
            <div className="ml-4 p-2 bg-blue-50 rounded-lg">
              <Lightbulb className="h-4 w-4 text-blue-600" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ')}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(project.stage)}`}>
            {project.stage.replace('_', '-').toUpperCase()}
          </span>
        </div>

        <div className="space-y-3">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700">Progress</span>
              <span className="text-xs text-gray-600">{project.overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.overallProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span className="text-sm">{project.coreTeamMembers.length + 1} members</span>
            </div>
            {project.fundingGoal && (
              <div className="flex items-center space-x-2 text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">${(project.fundingGoal / 1000).toFixed(0)}k goal</span>
              </div>
            )}
          </div>

          {/* Validation Indicators */}
          <div className="flex flex-wrap gap-2 pt-2">
            {project.hasValidatedIdea && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span className="text-xs">Validated</span>
              </div>
            )}
            {project.hasMarketResearch && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span className="text-xs">Researched</span>
              </div>
            )}
            {project.hasMVP && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span className="text-xs">MVP</span>
              </div>
            )}
          </div>

          {project.targetLaunchDate && (
            <div className="flex items-center space-x-2 text-gray-500 pt-2">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">
                Launch: {new Date(project.targetLaunchDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProjectsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    status?: string;
    stage?: string;
    search?: string;
  }>({});

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, [filter]);

  const fetchProjects = async () => {
    try {
      const { projects: fetchedProjects } = await getUserProjects({
        status: filter.status,
        stage: filter.stage,
        limit: 50
      });
      
      let filteredProjects = fetchedProjects;
      if (filter.search) {
        filteredProjects = fetchedProjects.filter(project =>
          project.name.toLowerCase().includes(filter.search!.toLowerCase()) ||
          project.description.toLowerCase().includes(filter.search!.toLowerCase())
        );
      }
      
      setProjects(filteredProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const projectStats = await getProjectStats();
      setStats(projectStats);
    } catch (error) {
      console.error('Error fetching project stats:', error);
    }
  };

  const handleProjectSelect = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    suffix?: string;
  }> = ({ title, value, icon, color, suffix = '' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}{suffix}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage and track your project portfolio</p>
        </div>
        <button
          onClick={() => navigate('/projects/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={<TrendingUp className="h-6 w-6 text-green-600" />}
            color="bg-green-50"
          />
          <StatCard
            title="Completed Projects"
            value={stats.completedProjects}
            icon={<CheckCircle className="h-6 w-6 text-purple-600" />}
            color="bg-purple-50"
          />
          <StatCard
            title="Milestone Rate"
            value={stats.milestoneCompletionRate}
            icon={<Target className="h-6 w-6 text-orange-600" />}
            color="bg-orange-50"
            suffix="%"
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={filter.search || ''}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filter.status || ''}
            onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="planning">Planning</option>
            <option value="development">Development</option>
            <option value="mvp">MVP</option>
            <option value="growth">Growth</option>
            <option value="mature">Mature</option>
          </select>

          <select
            value={filter.stage || ''}
            onChange={(e) => setFilter({ ...filter, stage: e.target.value || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Stages</option>
            <option value="pre_seed">Pre-Seed</option>
            <option value="seed">Seed</option>
            <option value="series_a">Series A</option>
            <option value="series_b">Series B</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first project or converting an approved idea.
            </p>
            <button
              onClick={() => navigate('/projects/new')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Project</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={handleProjectSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};