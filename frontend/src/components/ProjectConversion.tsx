import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  Target, 
  Lightbulb,
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { convertIdeaToProject, createProject, CreateProjectRequest } from '../services/projects';
import { getIdeasByUser } from '../services/ideas';
import { useAuth } from '../contexts/AuthContext';

interface Idea {
  id: string;
  title: string;
  description: string;
  businessModel?: string;
  targetMarket?: string;
  competitiveAdvantage?: string;
  fundingNeeded?: number;
  timeline?: string;
  riskFactors?: string[];
  successMetrics?: string[];
  approvalStatus: string;
  status: string;
  category: string;
  stage: string;
}

export const ProjectConversion: React.FC = () => {
  const { ideaId } = useParams<{ ideaId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectData, setProjectData] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    sourceIdeaId: ideaId,
    targetLaunchDate: '',
    estimatedBudget: undefined,
    fundingGoal: undefined,
    coreTeamMembers: []
  });

  useEffect(() => {
    fetchUserIdeas();
  }, []);

  useEffect(() => {
    if (ideaId && ideas.length > 0) {
      const idea = ideas.find(i => i.id === ideaId);
      if (idea) {
        setSelectedIdea(idea);
        populateProjectFromIdea(idea);
      }
    }
  }, [ideaId, ideas]);

  const fetchUserIdeas = async () => {
    if (!user) return;
    
    try {
      const userIdeas = await getIdeasByUser(user.id);
      const approvedIdeas = userIdeas.filter(idea => idea.approvalStatus === 'approved');
      setIdeas(approvedIdeas);
    } catch (error) {
      console.error('Error fetching user ideas:', error);
    }
  };

  const populateProjectFromIdea = (idea: Idea) => {
    setProjectData({
      name: idea.title,
      description: idea.description,
      sourceIdeaId: idea.id,
      estimatedBudget: idea.fundingNeeded,
      fundingGoal: idea.fundingNeeded,
      targetLaunchDate: '',
      coreTeamMembers: []
    });
    setShowCreateForm(true);
  };

  const handleIdeaSelect = (idea: Idea) => {
    setSelectedIdea(idea);
    populateProjectFromIdea(idea);
  };

  const handleQuickConvert = async (idea: Idea) => {
    setLoading(true);
    try {
      const project = await convertIdeaToProject(idea.id);
      navigate(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error converting idea to project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const project = await createProject(projectData);
      navigate(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartFromScratch = () => {
    setSelectedIdea(null);
    setProjectData({
      name: '',
      description: '',
      targetLaunchDate: '',
      estimatedBudget: undefined,
      fundingGoal: undefined,
      coreTeamMembers: []
    });
    setShowCreateForm(true);
  };

  if (showCreateForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {selectedIdea ? 'Convert Idea to Project' : 'Create New Project'}
          </h1>

          {selectedIdea && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Lightbulb className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900">{selectedIdea.title}</h3>
                  <p className="text-blue-700 text-sm mt-1">{selectedIdea.description}</p>
                  {selectedIdea.targetMarket && (
                    <p className="text-blue-600 text-sm mt-2">
                      <span className="font-medium">Target Market:</span> {selectedIdea.targetMarket}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleCreateProject} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                value={projectData.description}
                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Launch Date
                </label>
                <input
                  type="date"
                  value={projectData.targetLaunchDate}
                  onChange={(e) => setProjectData({ ...projectData, targetLaunchDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Budget ($)
                </label>
                <input
                  type="number"
                  value={projectData.estimatedBudget || ''}
                  onChange={(e) => setProjectData({ 
                    ...projectData, 
                    estimatedBudget: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funding Goal ($)
              </label>
              <input
                type="number"
                value={projectData.fundingGoal || ''}
                onChange={(e) => setProjectData({ 
                  ...projectData, 
                  fundingGoal: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => {
                  if (selectedIdea) {
                    setShowCreateForm(false);
                  } else {
                    navigate('/projects');
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !projectData.name || !projectData.description}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create Project</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Project</h1>
        <p className="text-gray-600">
          Convert your approved ideas into structured projects or start from scratch.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Convert from Ideas */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Convert from Ideas</h2>
              <p className="text-gray-600 text-sm">Turn your approved ideas into projects</p>
            </div>
          </div>

          {ideas.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No approved ideas available</p>
              <p className="text-gray-400 text-sm mt-2">
                Submit and get your ideas approved first
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ideas.slice(0, 3).map((idea) => (
                <div key={idea.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{idea.title}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      {idea.approvalStatus}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{idea.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center space-x-1">
                      <Target className="h-3 w-3" />
                      <span>{idea.category}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{idea.stage}</span>
                    </span>
                    {idea.fundingNeeded && (
                      <span className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${idea.fundingNeeded.toLocaleString()}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleQuickConvert(idea)}
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      Quick Convert
                    </button>
                    <button
                      onClick={() => handleIdeaSelect(idea)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                    >
                      Customize
                    </button>
                  </div>
                </div>
              ))}
              
              {ideas.length > 3 && (
                <button
                  onClick={() => navigate('/ideas')}
                  className="w-full py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all {ideas.length} ideas →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Start from Scratch */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Start from Scratch</h2>
              <p className="text-gray-600 text-sm">Create a new project without an existing idea</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3 text-gray-700">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Define your own project scope</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Set custom milestones</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Build your team from day one</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Track progress systematically</span>
            </div>
          </div>

          <button
            onClick={handleStartFromScratch}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Create New Project</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};