import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Calendar,
  User,
  TrendingUp,
  AlertTriangle,
  Filter,
  Search,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  FileText,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  businessModel: string;
  targetMarket: string;
  competitiveAdvantage: string;
  fundingNeeded: number;
  timeline: string;
  riskFactors: string[];
  successMetrics: string[];
  status: string;
  approvalStatus: string;
  submissionCompleted: boolean;
  submittedAt: string;
  creatorName: string;
  creatorEmail: string;
  approvedByName?: string;
  rejectionReason?: string;
  adminFeedback?: string;
}

interface AdminStats {
  totalIdeas: number;
  pendingReview: number;
  approvedIdeas: number;
  rejectedIdeas: number;
  averageReviewTime: string;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [ideasForReview, setIdeasForReview] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [adminFeedback, setAdminFeedback] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('submitted');
  const [searchQuery, setSearchQuery] = useState('');

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
              <p className="text-sm text-red-700 mt-1">
                Admin access is required to view this dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadIdeasForReview();
    loadAdminStats();
  }, [filterStatus]);

  const loadIdeasForReview = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ideas/admin/review', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIdeasForReview(data.ideas || []);
      }
    } catch (error) {
      console.error('Error loading ideas for review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminStats = async () => {
    try {
      // Mock stats for now - would come from dedicated endpoint
      setStats({
        totalIdeas: 45,
        pendingReview: ideasForReview.length,
        approvedIdeas: 32,
        rejectedIdeas: 8,
        averageReviewTime: '1.5 days',
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  const handleReviewAction = async () => {
    if (!selectedIdea || !reviewAction) return;

    try {
      setIsLoading(true);
      const endpoint = reviewAction === 'approve' 
        ? `/api/ideas/${selectedIdea.id}/approve`
        : `/api/ideas/${selectedIdea.id}/reject`;

      const body: any = {};
      if (adminFeedback.trim()) {
        body.adminFeedback = adminFeedback;
      }
      if (reviewAction === 'reject' && rejectionReason.trim()) {
        body.rejectionReason = rejectionReason;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowReviewModal(false);
        setSelectedIdea(null);
        setReviewAction(null);
        setAdminFeedback('');
        setRejectionReason('');
        loadIdeasForReview();
        loadAdminStats();
      } else {
        alert('Failed to process review. Please try again.');
      }
    } catch (error) {
      console.error('Error processing review:', error);
      alert('Failed to process review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredIdeas = ideasForReview.filter(idea => {
    const matchesSearch = searchQuery === '' || 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || idea.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const renderStatsCards = () => {
    if (!stats) return null;

    const statCards = [
      {
        title: 'Total Ideas',
        value: stats.totalIdeas,
        icon: FileText,
        color: 'bg-blue-500',
      },
      {
        title: 'Pending Review',
        value: stats.pendingReview,
        icon: Clock,
        color: 'bg-yellow-500',
      },
      {
        title: 'Approved',
        value: stats.approvedIdeas,
        icon: CheckCircle,
        color: 'bg-green-500',
      },
      {
        title: 'Rejected',
        value: stats.rejectedIdeas,
        icon: XCircle,
        color: 'bg-red-500',
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white border rounded-lg p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderIdeaCard = (idea: Idea) => (
    <div key={idea.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{idea.title}</h3>
          <p className="text-sm text-gray-600 mb-2">
            by {idea.creatorName} • {idea.category}
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            Submitted {new Date(idea.submittedAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              idea.approvalStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : idea.approvalStatus === 'approved'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {idea.approvalStatus}
          </span>
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{idea.description}</p>

      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Timeline:</span>
            <span className="ml-2 text-gray-600">{idea.timeline}</span>
          </div>
          {idea.fundingNeeded && (
            <div>
              <span className="font-medium text-gray-700">Funding:</span>
              <span className="ml-2 text-gray-600">${idea.fundingNeeded.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div>
          <span className="font-medium text-gray-700 text-sm">Risks:</span>
          <span className="ml-2 text-gray-600 text-sm">
            {idea.riskFactors.length} identified
          </span>
        </div>

        <div>
          <span className="font-medium text-gray-700 text-sm">Success Metrics:</span>
          <span className="ml-2 text-gray-600 text-sm">
            {idea.successMetrics.length} defined
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>{idea.creatorEmail}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedIdea(idea)}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </button>
          {idea.approvalStatus === 'pending' && (
            <>
              <button
                onClick={() => {
                  setSelectedIdea(idea);
                  setReviewAction('approve');
                  setShowReviewModal(true);
                }}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                Approve
              </button>
              <button
                onClick={() => {
                  setSelectedIdea(idea);
                  setReviewAction('reject');
                  setShowReviewModal(true);
                }}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderIdeaDetailsModal = () => {
    if (!selectedIdea || showReviewModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{selectedIdea.title}</h2>
              <button
                onClick={() => setSelectedIdea(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Creator:</span>
                    <span className="ml-2">{selectedIdea.creatorName}</span>
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>
                    <span className="ml-2">{selectedIdea.category}</span>
                  </div>
                  <div>
                    <span className="font-medium">Timeline:</span>
                    <span className="ml-2">{selectedIdea.timeline}</span>
                  </div>
                  {selectedIdea.fundingNeeded && (
                    <div>
                      <span className="font-medium">Funding:</span>
                      <span className="ml-2">${selectedIdea.fundingNeeded.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{selectedIdea.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Business Model</h3>
                <p className="text-gray-700">{selectedIdea.businessModel}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Target Market</h3>
                <p className="text-gray-700">{selectedIdea.targetMarket}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Competitive Advantage</h3>
                <p className="text-gray-700">{selectedIdea.competitiveAdvantage}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Risk Factors</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedIdea.riskFactors.map((risk, index) => (
                    <li key={index} className="text-gray-700">{risk}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Success Metrics</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedIdea.successMetrics.map((metric, index) => (
                    <li key={index} className="text-gray-700">{metric}</li>
                  ))}
                </ul>
              </div>

              {(selectedIdea.rejectionReason || selectedIdea.adminFeedback) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Admin Review</h3>
                  {selectedIdea.rejectionReason && (
                    <div className="mb-2">
                      <span className="font-medium text-red-700">Rejection Reason:</span>
                      <p className="text-red-600 mt-1">{selectedIdea.rejectionReason}</p>
                    </div>
                  )}
                  {selectedIdea.adminFeedback && (
                    <div>
                      <span className="font-medium text-gray-700">Admin Feedback:</span>
                      <p className="text-gray-600 mt-1">{selectedIdea.adminFeedback}</p>
                    </div>
                  )}
                  {selectedIdea.approvedByName && (
                    <div className="mt-2 text-sm text-gray-600">
                      Reviewed by {selectedIdea.approvedByName}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedIdea.approvalStatus === 'pending' && (
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setReviewAction('reject');
                    setShowReviewModal(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setReviewAction('approve');
                    setShowReviewModal(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReviewModal = () => {
    if (!showReviewModal || !selectedIdea || !reviewAction) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Idea
            </h3>
            <button
              onClick={() => setShowReviewModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            You are about to {reviewAction} "{selectedIdea.title}" by {selectedIdea.creatorName}.
          </p>

          {reviewAction === 'reject' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Feedback (Optional)
            </label>
            <textarea
              value={adminFeedback}
              onChange={(e) => setAdminFeedback(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional feedback for the creator..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowReviewModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleReviewAction}
              disabled={reviewAction === 'reject' && !rejectionReason.trim()}
              className={`px-6 py-2 rounded-lg text-white disabled:opacity-50 ${
                reviewAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Idea
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Review and manage idea submissions</p>
      </div>

      {renderStatsCards()}

      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Ideas for Review</h2>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredIdeas.map((idea) => renderIdeaCard(idea))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas to review</h3>
            <p className="text-gray-600">
              {searchQuery || filterStatus !== 'submitted'
                ? 'No ideas match your current filters.'
                : 'All ideas have been reviewed.'}
            </p>
          </div>
        )}
      </div>

      {renderIdeaDetailsModal()}
      {renderReviewModal()}
    </div>
  );
};