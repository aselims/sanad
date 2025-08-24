import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  User,
  Mail,
  ExternalLink,
  Zap,
  Building2,
  MapPin,
  Award
} from 'lucide-react';
import { Idea, IdeaStage, IdeaStatus, User as UserType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getIdeaById } from '../services/ideas';

interface IdeaDetailsProps {
  ideaId?: string;
  onBack?: () => void;
}

const stageColors = {
  [IdeaStage.CONCEPT]: 'bg-blue-100 text-blue-800',
  [IdeaStage.PROTOTYPE]: 'bg-purple-100 text-purple-800',
  [IdeaStage.VALIDATED]: 'bg-green-100 text-green-800',
  [IdeaStage.SCALING]: 'bg-orange-100 text-orange-800'
};

const statusColors = {
  [IdeaStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [IdeaStatus.SUBMITTED]: 'bg-blue-100 text-blue-800',
  [IdeaStatus.UNDER_REVIEW]: 'bg-yellow-100 text-yellow-800',
  [IdeaStatus.APPROVED]: 'bg-green-100 text-green-800',
  [IdeaStatus.REJECTED]: 'bg-red-100 text-red-800',
  [IdeaStatus.ACTIVE]: 'bg-emerald-100 text-emerald-800',
  [IdeaStatus.COMPLETED]: 'bg-slate-100 text-slate-800'
};

export const IdeaDetails: React.FC<IdeaDetailsProps> = ({ ideaId: propIdeaId, onBack }) => {
  const { id: routeIdeaId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const ideaId = propIdeaId || routeIdeaId;
  
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [showInterestModal, setShowInterestModal] = useState(false);

  useEffect(() => {
    if (ideaId) {
      fetchIdea(ideaId);
    }
  }, [ideaId]);

  const fetchIdea = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const fetchedIdea = await getIdeaById(id);
      if (fetchedIdea) {
        // Convert Collaboration format to Idea format
        const ideaData: Idea = {
          id: fetchedIdea.id,
          title: fetchedIdea.title,
          description: fetchedIdea.description,
          category: fetchedIdea.ideaDetails?.category || '',
          stage: (fetchedIdea.ideaDetails?.stage as IdeaStage) || IdeaStage.CONCEPT,
          status: IdeaStatus.ACTIVE,
          approvalStatus: 'approved' as any,
          targetAudience: fetchedIdea.ideaDetails?.targetAudience || '',
          potentialImpact: fetchedIdea.ideaDetails?.potentialImpact || '',
          resourcesNeeded: fetchedIdea.ideaDetails?.resourcesNeeded,
          createdById: fetchedIdea.createdById || '',
          participants: fetchedIdea.participants || [],
          createdAt: fetchedIdea.createdAt,
          updatedAt: fetchedIdea.updatedAt,
          upvotes: fetchedIdea.upvotes || 0,
          downvotes: fetchedIdea.downvotes || 0,
          submissionCompleted: true
        };
        setIdea(ideaData);
      } else {
        setError('Idea not found');
      }
    } catch (err) {
      console.error('Error fetching idea:', err);
      setError('Failed to load idea');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/workspace?filter=ideas');
    }
  };

  const handleVote = (voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      alert('Please sign in to vote');
      return;
    }
    
    // Simulate vote update
    if (idea) {
      const newIdea = { ...idea };
      if (userVote === voteType) {
        // Remove vote
        if (voteType === 'up') newIdea.upvotes--;
        else newIdea.downvotes--;
        setUserVote(null);
      } else {
        // Add/change vote
        if (userVote === 'up' && voteType === 'down') {
          newIdea.upvotes--;
          newIdea.downvotes++;
        } else if (userVote === 'down' && voteType === 'up') {
          newIdea.downvotes--;
          newIdea.upvotes++;
        } else {
          if (voteType === 'up') newIdea.upvotes++;
          else newIdea.downvotes++;
        }
        setUserVote(voteType);
      }
      setIdea(newIdea);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Idea Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Ideas
            </button>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <Bookmark className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageColors[idea.stage]} bg-white/20 text-white`}>
                    {idea.stage.charAt(0).toUpperCase() + idea.stage.slice(1)}
                  </span>
                  <span className="text-white/80">#{idea.category}</span>
                </div>
                
                <h1 className="text-4xl font-bold mb-4 leading-tight">{idea.title}</h1>
                <p className="text-xl text-white/90 leading-relaxed">{idea.description}</p>
                
                <div className="flex items-center mt-6 space-x-6">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-white/80" />
                    <span className="text-white/90">
                      {idea.createdBy?.firstName || 'Anonymous'} {idea.createdBy?.lastName || 'Creator'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-white/80" />
                    <span className="text-white/90">
                      {new Date(idea.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-white/80" />
                    <span className="text-white/90">{idea.participants.length} participants</span>
                  </div>
                </div>
              </div>

              {/* Voting Section */}
              <div className="lg:ml-8 mt-6 lg:mt-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <button
                      onClick={() => handleVote('up')}
                      className={`p-3 rounded-full transition-all ${
                        userVote === 'up' 
                          ? 'bg-green-500 text-white shadow-lg' 
                          : 'bg-white/20 hover:bg-white/30 text-white'
                      }`}
                    >
                      <ThumbsUp className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => handleVote('down')}
                      className={`p-3 rounded-full transition-all ${
                        userVote === 'down' 
                          ? 'bg-red-500 text-white shadow-lg' 
                          : 'bg-white/20 hover:bg-white/30 text-white'
                      }`}
                    >
                      <ThumbsDown className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {idea.upvotes - idea.downvotes}
                  </div>
                  <div className="text-sm text-white/70">Net Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Business Canvas */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Building2 className="h-6 w-6 mr-3 text-indigo-600" />
                Business Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {idea.businessModel && (
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Business Model</h3>
                    <p className="text-gray-700 leading-relaxed">{idea.businessModel}</p>
                  </div>
                )}
                
                {idea.targetMarket && (
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Target Market</h3>
                    <p className="text-gray-700 leading-relaxed">{idea.targetMarket}</p>
                  </div>
                )}
                
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Target Audience</h3>
                  <p className="text-gray-700 leading-relaxed">{idea.targetAudience}</p>
                </div>
                
                {idea.competitiveAdvantage && (
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Competitive Advantage</h3>
                    <p className="text-gray-700 leading-relaxed">{idea.competitiveAdvantage}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Impact & Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="h-6 w-6 mr-3 text-green-600" />
                Impact & Success Metrics
              </h2>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Potential Impact</h3>
                <p className="text-gray-700 leading-relaxed">{idea.potentialImpact}</p>
              </div>

              {idea.successMetrics && idea.successMetrics.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Success Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {idea.successMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Risk Assessment */}
            {idea.riskFactors && idea.riskFactors.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <AlertTriangle className="h-6 w-6 mr-3 text-amber-600" />
                  Risk Assessment
                </h2>
                
                <div className="grid grid-cols-1 gap-4">
                  {idea.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-start p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Stage</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${stageColors[idea.stage]}`}>
                    {idea.stage.charAt(0).toUpperCase() + idea.stage.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="text-gray-900 font-medium">{idea.category}</span>
                </div>
                {idea.fundingNeeded && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Funding Needed</span>
                    <span className="text-green-600 font-bold">
                      {formatCurrency(idea.fundingNeeded)}
                    </span>
                  </div>
                )}
                {idea.timeline && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Timeline</span>
                    <span className="text-gray-900 font-medium">{idea.timeline}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Resources Needed */}
            {idea.resourcesNeeded && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Resources Needed
                </h3>
                <p className="text-gray-700 leading-relaxed">{idea.resourcesNeeded}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Get Involved</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowInterestModal(true)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  Express Interest
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Join Team
                </button>
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
                  Invest/Fund
                </button>
              </div>
            </div>

            {/* Creator Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Created By</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {(idea.createdBy?.firstName?.charAt(0) || 'A').toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {idea.createdBy?.firstName || 'Anonymous'} {idea.createdBy?.lastName || 'Creator'}
                  </p>
                  <p className="text-sm text-gray-600">{idea.createdBy?.role || 'Innovator'}</p>
                </div>
              </div>
              <button className="w-full mt-4 border border-indigo-600 text-indigo-600 py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors">
                View Profile
              </button>
            </div>

            {/* Admin Feedback */}
            {idea.adminFeedback && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Admin Feedback
                </h3>
                <p className="text-green-800 leading-relaxed">{idea.adminFeedback}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
        >
          <ArrowLeft className="h-5 w-5 rotate-90" />
        </button>
      </div>
    </div>
  );
};

export default IdeaDetails;