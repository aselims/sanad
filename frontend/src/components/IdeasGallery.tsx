import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search,
  Filter,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  Star,
  Grid,
  List,
  ArrowUpRight,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Building2
} from 'lucide-react';
import { Idea, IdeaStage, IdeaStatus, ApprovalStatus } from '../types';
import { getAllIdeasDirect } from '../services/ideas';
import { useAuth } from '../contexts/AuthContext';

const stageColors = {
  [IdeaStage.CONCEPT]: 'bg-blue-100 text-blue-800 border-blue-200',
  [IdeaStage.PROTOTYPE]: 'bg-purple-100 text-purple-800 border-purple-200',
  [IdeaStage.VALIDATED]: 'bg-green-100 text-green-800 border-green-200',
  [IdeaStage.SCALING]: 'bg-orange-100 text-orange-800 border-orange-200'
};

const statusColors = {
  [IdeaStatus.DRAFT]: 'bg-gray-100 text-gray-800 border-gray-200',
  [IdeaStatus.SUBMITTED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [IdeaStatus.UNDER_REVIEW]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [IdeaStatus.APPROVED]: 'bg-green-100 text-green-800 border-green-200',
  [IdeaStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-200',
  [IdeaStatus.ACTIVE]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [IdeaStatus.COMPLETED]: 'bg-slate-100 text-slate-800 border-slate-200'
};

interface IdeaCardProps {
  idea: Idea;
  viewMode: 'grid' | 'list';
  onView: (id: string) => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, viewMode, onView }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${stageColors[idea.stage]}`}>
                {idea.stage}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[idea.status]}`}>
                {idea.status}
              </span>
              {idea.approvalStatus === ApprovalStatus.APPROVED && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approved
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{idea.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{idea.description}</p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                <span>{idea.upvotes || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{idea.participants?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
              </div>
              {idea.fundingNeeded && (
                <div className="flex items-center gap-1 text-green-600 font-medium">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatCurrency(idea.fundingNeeded)}</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => onView(idea.id)}
            className="ml-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View Details
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${stageColors[idea.stage]}`}>
              {idea.stage}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[idea.status]}`}>
              {idea.status}
            </span>
          </div>
          {idea.approvalStatus === ApprovalStatus.APPROVED && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {idea.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {idea.description}
        </p>
        
        {idea.category && (
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{idea.category}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4 text-green-500" />
              <span className="font-medium">{idea.upvotes || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span>{idea.participants?.length || 0}</span>
            </div>
            {idea.views && (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-purple-500" />
                <span>{idea.views}</span>
              </div>
            )}
          </div>
          
          {idea.fundingNeeded && (
            <div className="text-green-600 font-bold text-base">
              {formatCurrency(idea.fundingNeeded)}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {(idea.createdBy?.firstName?.charAt(0) || 'A').toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {idea.createdBy?.firstName || 'Anonymous'} {idea.createdBy?.lastName || 'Creator'}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(idea.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => onView(idea.id)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View Details
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const IdeasGallery: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedStage, setSelectedStage] = useState<IdeaStage | 'all'>(
    (searchParams.get('stage') as IdeaStage) || 'all'
  );
  const [selectedStatus, setSelectedStatus] = useState<IdeaStatus | 'all'>(
    (searchParams.get('status') as IdeaStatus) || 'all'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadIdeas();
  }, []);

  useEffect(() => {
    // Update URL with filter parameters
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedStage !== 'all') params.set('stage', selectedStage);
    if (selectedStatus !== 'all') params.set('status', selectedStatus);
    setSearchParams(params);
  }, [searchTerm, selectedStage, selectedStatus, setSearchParams]);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedIdeas = await getAllIdeasDirect();
      // Filter to show only approved ideas in public gallery
      const approvedIdeas = fetchedIdeas.filter(
        idea => idea.approvalStatus === ApprovalStatus.APPROVED || 
                idea.status === IdeaStatus.ACTIVE
      );
      setIdeas(approvedIdeas);
    } catch (err) {
      console.error('Error loading ideas:', err);
      setError('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    if (searchTerm && !idea.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !idea.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !idea.category.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (selectedStage !== 'all' && idea.stage !== selectedStage) {
      return false;
    }
    
    if (selectedStatus !== 'all' && idea.status !== selectedStatus) {
      return false;
    }
    
    return true;
  });

  const handleViewIdea = (id: string) => {
    navigate(`/idea/${id}`);
  };

  const handleCreateIdea = () => {
    navigate('/submit-idea');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading ideas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Ideas</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadIdeas}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Ideas Gallery</h1>
              <span className="ml-3 px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                {filteredIdeas.length} {filteredIdeas.length === 1 ? 'idea' : 'ideas'}
              </span>
            </div>
            
            <button
              onClick={handleCreateIdea}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit New Idea
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search ideas by title, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stage
                  </label>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value as IdeaStage | 'all')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Stages</option>
                    <option value={IdeaStage.CONCEPT}>Concept</option>
                    <option value={IdeaStage.PROTOTYPE}>Prototype</option>
                    <option value={IdeaStage.VALIDATED}>Validated</option>
                    <option value={IdeaStage.SCALING}>Scaling</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as IdeaStatus | 'all')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value={IdeaStatus.ACTIVE}>Active</option>
                    <option value={IdeaStatus.APPROVED}>Approved</option>
                    <option value={IdeaStatus.UNDER_REVIEW}>Under Review</option>
                    <option value={IdeaStatus.COMPLETED}>Completed</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ideas Grid/List */}
        {filteredIdeas.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No ideas found</h3>
            <p className="text-gray-600 mb-6">
              {ideas.length === 0 
                ? "Be the first to submit an innovative idea!" 
                : "Try adjusting your search or filter criteria."
              }
            </p>
            <button
              onClick={handleCreateIdea}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Submit Your Idea
            </button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                viewMode={viewMode}
                onView={handleViewIdea}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeasGallery;