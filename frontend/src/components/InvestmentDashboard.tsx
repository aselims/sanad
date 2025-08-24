import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  MessageSquare
} from 'lucide-react';
import {
  getInvestments,
  getInvestmentPipelineStats,
  updateInvestment,
  addMeetingRecord,
  type Investment,
  type InvestmentFilters,
  type InvestmentPipelineStats,
  getInvestmentStatusDisplay,
  getInvestmentTypeDisplay,
  getInvestmentStatusColor,
  formatAmount,
  getDaysInCurrentStatus,
  isActiveInvestment,
  InvestmentStatus,
  InvestmentType
} from '../services/investments';
import { getInvestors, type Investor } from '../services/investors';

const InvestmentDashboard: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<InvestmentPipelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InvestmentFilters>({
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'analytics'>('overview');

  useEffect(() => {
    fetchInvestments();
    fetchStats();
  }, [filters]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const result = await getInvestments(filters);
      setInvestments(result.investments);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch investments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await getInvestmentPipelineStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleFilterChange = (key: keyof InvestmentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleStatusUpdate = async (investmentId: string, status: InvestmentStatus) => {
    try {
      await updateInvestment(investmentId, { status });
      fetchInvestments(); // Refresh the list
      if (selectedInvestment?.id === investmentId) {
        setSelectedInvestment(null); // Close modal if updating selected investment
      }
    } catch (err: any) {
      console.error('Failed to update investment status:', err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Error Loading Dashboard</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={fetchInvestments}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Investment Pipeline</h1>
                <p className="text-gray-600 mt-1">
                  Track and manage your investment opportunities
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6">
              <nav className="flex space-x-8" aria-label="Tabs">
                {[
                  { id: 'overview', name: 'Overview', icon: TrendingUp },
                  { id: 'pipeline', name: 'Pipeline', icon: BarChart3 },
                  { id: 'analytics', name: 'Analytics', icon: Users }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.performance.totalInvestments}
                  </div>
                  <div className="text-sm text-gray-600">Total Investments</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    ${(stats.performance.totalAmount / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.performance.conversionRate}%
                  </div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(stats.performance.averageTimeToClose)}
                  </div>
                  <div className="text-sm text-gray-600">Avg. Days to Close</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Filters */}
            {showFilters && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={filters.status || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Statuses</option>
                      {Object.values(InvestmentStatus).map(status => (
                        <option key={status} value={status}>
                          {getInvestmentStatusDisplay(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={filters.investmentType || ''}
                      onChange={(e) => handleFilterChange('investmentType', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      {Object.values(InvestmentType).map(type => (
                        <option key={type} value={type}>
                          {getInvestmentTypeDisplay(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                    <input
                      type="number"
                      value={filters.minAmount || ''}
                      onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={filters.currency || ''}
                      onChange={(e) => handleFilterChange('currency', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Currencies</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Investment List */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Investment Pipeline</h2>
              </div>
              
              {loading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : investments.length === 0 ? (
                <div className="p-12 text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No investments found</h3>
                  <p className="text-gray-600 mb-4">Start tracking your investment opportunities</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {investments.map((investment) => (
                    <InvestmentRow
                      key={investment.id}
                      investment={investment}
                      onStatusUpdate={handleStatusUpdate}
                      onClick={() => setSelectedInvestment(investment)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFilterChange('page', pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handleFilterChange('page', pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && stats && (
          <div className="space-y-6">
            {/* Status Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Status Distribution</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.statusDistribution.map((status) => (
                  <div key={status.status} className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 bg-${getInvestmentStatusColor(status.status)}-100`}>
                      <span className={`text-${getInvestmentStatusColor(status.status)}-600 font-semibold`}>
                        {status.count}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {getInvestmentStatusDisplay(status.status)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatAmount(status.totalAmount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Type Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Investment Type Distribution</h2>
              <div className="space-y-4">
                {stats.typeDistribution.map((type) => (
                  <div key={type.type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                      <span className="font-medium text-gray-900">
                        {getInvestmentTypeDisplay(type.type)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{type.count}</div>
                      <div className="text-sm text-gray-600">
                        {formatAmount(type.totalAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && stats && (
          <div className="space-y-6">
            {/* Monthly Trends */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h2>
              <div className="space-y-4">
                {stats.monthlyTrends.slice(0, 6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        New: {month.newInvestments}
                      </div>
                      <div className="text-sm text-gray-600">
                        Closed: {month.closedInvestments}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(month.totalAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.performance.closedInvestments}
                  </div>
                  <div className="text-sm text-gray-600">Closed Deals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.performance.failedInvestments}
                  </div>
                  <div className="text-sm text-gray-600">Failed Deals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatAmount(stats.performance.closedAmount)}
                  </div>
                  <div className="text-sm text-gray-600">Closed Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(stats.performance.averageTimeToClose)}d
                  </div>
                  <div className="text-sm text-gray-600">Avg. Close Time</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Investment Detail Modal */}
      {selectedInvestment && (
        <InvestmentModal
          investment={selectedInvestment}
          onClose={() => setSelectedInvestment(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

// Investment Row Component
const InvestmentRow: React.FC<{
  investment: Investment;
  onStatusUpdate: (id: string, status: InvestmentStatus) => void;
  onClick: () => void;
}> = ({ investment, onStatusUpdate, onClick }) => {
  const statusColor = getInvestmentStatusColor(investment.status);
  const daysInStatus = getDaysInCurrentStatus(investment);

  return (
    <div
      onClick={onClick}
      className="p-6 hover:bg-gray-50 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {investment.project?.name || 'Unnamed Project'}
              </h3>
              <p className="text-sm text-gray-600">
                {investment.investor?.firmName || 'Unknown Investor'}
              </p>
            </div>
          </div>
          
          <div className="mt-2 flex items-center space-x-6">
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-1" />
              {formatAmount(investment.amount, investment.currency)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(investment.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              {daysInStatus} days in status
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
            {getInvestmentStatusDisplay(investment.status)}
          </span>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {getInvestmentTypeDisplay(investment.investmentType)}
            </div>
            {investment.equityPercentage && (
              <div className="text-xs text-gray-600">
                {investment.equityPercentage}% equity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Investment Detail Modal Component
const InvestmentModal: React.FC<{
  investment: Investment;
  onClose: () => void;
  onStatusUpdate: (id: string, status: InvestmentStatus) => void;
}> = ({ investment, onClose, onStatusUpdate }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'documents'>('details');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {investment.project?.name || 'Investment Details'}
              </h2>
              <p className="text-gray-600 mt-1">
                {investment.investor?.firmName} • {formatAmount(investment.amount, investment.currency)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              {[
                { id: 'details', name: 'Details', icon: FileText },
                { id: 'timeline', name: 'Timeline', icon: Clock },
                { id: 'documents', name: 'Documents', icon: FileText }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{formatAmount(investment.amount, investment.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{getInvestmentTypeDisplay(investment.investmentType)}</span>
                    </div>
                    {investment.equityPercentage && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Equity:</span>
                        <span className="font-medium">{investment.equityPercentage}%</span>
                      </div>
                    )}
                    {investment.valuation && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valuation:</span>
                        <span className="font-medium">{formatAmount(investment.valuation, investment.currency)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {investment.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                    <p className="text-gray-600">{investment.notes}</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Status Update</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Current Status:</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${getInvestmentStatusColor(investment.status)}-100 text-${getInvestmentStatusColor(investment.status)}-800`}>
                        {getInvestmentStatusDisplay(investment.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(InvestmentStatus).filter(status => status !== investment.status).slice(0, 4).map(status => (
                        <button
                          key={status}
                          onClick={() => onStatusUpdate(investment.id, status)}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          {getInvestmentStatusDisplay(status)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {investment.meetingHistory && investment.meetingHistory.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Meetings</h3>
                    <div className="space-y-3">
                      {investment.meetingHistory.slice(0, 3).map((meeting, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{meeting.type}</span>
                            <span className="text-xs text-gray-600">
                              {new Date(meeting.date).toLocaleDateString()}
                            </span>
                          </div>
                          {meeting.notes && (
                            <p className="text-sm text-gray-600">{meeting.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Investment Timeline</h3>
              <div className="space-y-4">
                {[
                  { date: investment.createdAt, event: 'Investment interest expressed', icon: TrendingUp },
                  investment.dueDiligenceStartDate && { date: investment.dueDiligenceStartDate, event: 'Due diligence started', icon: FileText },
                  investment.termSheetDate && { date: investment.termSheetDate, event: 'Term sheet signed', icon: CheckCircle },
                  investment.closingDate && { date: investment.closingDate, event: 'Investment closed', icon: CheckCircle },
                ].filter(Boolean).map((item, index) => {
                  if (!item) return null;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <item.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.event}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </button>
              </div>
              
              {investment.documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {investment.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="font-medium text-gray-900">{doc}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentDashboard;