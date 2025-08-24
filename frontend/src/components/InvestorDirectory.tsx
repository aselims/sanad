import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Users,
  MapPin,
  DollarSign,
  Star,
  Verified,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Building,
  Mail,
  Phone,
  Globe,
  TrendingUp,
  Eye,
  Clock
} from 'lucide-react';
import {
  getInvestors,
  getInvestorStats,
  type Investor,
  type InvestorFilters,
  type InvestorStats,
  formatInvestmentRange,
  getInvestorTypeDisplay,
  getResponseRateDescription
} from '../services/investors';

const InvestorDirectory: React.FC = () => {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [stats, setStats] = useState<InvestorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InvestorFilters>({
    page: 1,
    limit: 20,
    isVerified: true,
    acceptingPitches: true
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Available filter options
  const investorTypes = [
    { value: 'angel', label: 'Angel Investor' },
    { value: 'vc', label: 'Venture Capital' },
    { value: 'corporate', label: 'Corporate Venture' },
    { value: 'family_office', label: 'Family Office' }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SAR', 'AED'];

  const focusAreas = [
    'Technology', 'Healthcare', 'FinTech', 'EdTech', 'CleanTech', 
    'Consumer', 'Enterprise', 'AI/ML', 'Blockchain', 'IoT', 
    'Cybersecurity', 'Biotech', 'E-commerce', 'SaaS'
  ];

  const stages = [
    'pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'growth', 'late_stage'
  ];

  useEffect(() => {
    fetchInvestors();
    fetchStats();
  }, [filters]);

  const fetchInvestors = async () => {
    try {
      setLoading(true);
      const result = await getInvestors(filters);
      setInvestors(result.investors);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch investors');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await getInvestorStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleFilterChange = (key: keyof InvestorFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('search', searchTerm);
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      isVerified: true,
      acceptingPitches: true
    });
    setSearchTerm('');
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Error Loading Investors</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={fetchInvestors}
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
                <h1 className="text-2xl font-bold text-gray-900">Investor Directory</h1>
                <p className="text-gray-600 mt-1">
                  Connect with verified investors looking for opportunities
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {showFilters ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            {stats && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-blue-600 text-2xl font-bold">
                    {stats.overview.totalInvestors}
                  </div>
                  <div className="text-blue-700 text-sm font-medium">Total Investors</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-green-600 text-2xl font-bold">
                    {stats.overview.verifiedInvestors}
                  </div>
                  <div className="text-green-700 text-sm font-medium">Verified</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-purple-600 text-2xl font-bold">
                    {stats.overview.acceptingPitches}
                  </div>
                  <div className="text-purple-700 text-sm font-medium">Accepting Pitches</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-orange-600 text-2xl font-bold">
                    ${Math.round(stats.investments.averageAmount / 1000)}K
                  </div>
                  <div className="text-orange-700 text-sm font-medium">Avg. Investment</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search investors by name, firm, or focus area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investor Type
                  </label>
                  <select
                    value={filters.investorType || ''}
                    onChange={(e) => handleFilterChange('investorType', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    {investorTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., United States"
                    value={filters.country || ''}
                    onChange={(e) => handleFilterChange('country', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={filters.currency || ''}
                    onChange={(e) => handleFilterChange('currency', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Currencies</option>
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Investment ($)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minAmount || ''}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Investment ($)
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filters.maxAmount || ''}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.isVerified || false}
                        onChange={(e) => handleFilterChange('isVerified', e.target.checked || undefined)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Verified only</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.acceptingPitches || false}
                        onChange={(e) => handleFilterChange('acceptingPitches', e.target.checked || undefined)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Accepting pitches</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear all filters
                </button>
                <div className="text-sm text-gray-600">
                  {pagination.total} investor{pagination.total !== 1 ? 's' : ''} found
                </div>
              </div>
            </div>
          )}

          {/* Investor Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : investors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No investors found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investors.map((investor) => (
                <InvestorCard
                  key={investor.id}
                  investor={investor}
                  onClick={() => setSelectedInvestor(investor)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  const pageNum = Math.max(1, pagination.page - 2) + i;
                  if (pageNum > pagination.pages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 border rounded-md text-sm font-medium ${
                        pageNum === pagination.page
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Investor Detail Modal */}
      {selectedInvestor && (
        <InvestorModal
          investor={selectedInvestor}
          onClose={() => setSelectedInvestor(null)}
        />
      )}
    </div>
  );
};

// Investor Card Component
const InvestorCard: React.FC<{
  investor: Investor;
  onClick: () => void;
}> = ({ investor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">{investor.firmName}</h3>
            {investor.isVerified && (
              <Verified className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {getInvestorTypeDisplay(investor.investorType)}
          </p>
        </div>
        {investor.logo && (
          <img
            src={investor.logo}
            alt={investor.firmName}
            className="h-12 w-12 rounded-lg object-cover"
          />
        )}
      </div>

      {/* Location */}
      {(investor.city || investor.country) && (
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">
            {[investor.city, investor.country].filter(Boolean).join(', ')}
          </span>
        </div>
      )}

      {/* Investment Range */}
      <div className="flex items-center text-gray-600 mb-3">
        <DollarSign className="h-4 w-4 mr-1" />
        <span className="text-sm">{formatInvestmentRange(investor)}</span>
      </div>

      {/* Focus Areas */}
      {investor.focusAreas.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {investor.focusAreas.slice(0, 3).map((area, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {area}
              </span>
            ))}
            {investor.focusAreas.length > 3 && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{investor.focusAreas.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {investor.portfolioSize}
          </div>
          <div className="text-xs text-gray-600">Portfolio</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {investor.responseRate}%
          </div>
          <div className="text-xs text-gray-600">Response Rate</div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          {investor.acceptingPitches ? (
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1"></div>
              Accepting Pitches
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1"></div>
              Not Active
            </span>
          )}
        </div>
        <div className="flex items-center text-gray-400">
          <Eye className="h-3 w-3 mr-1" />
          <span className="text-xs">{investor.profileViews}</span>
        </div>
      </div>
    </div>
  );
};

// Investor Detail Modal Component
const InvestorModal: React.FC<{
  investor: Investor;
  onClose: () => void;
}> = ({ investor, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {investor.logo && (
                <img
                  src={investor.logo}
                  alt={investor.firmName}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-gray-900">{investor.firmName}</h2>
                  {investor.isVerified && (
                    <Verified className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  {getInvestorTypeDisplay(investor.investorType)}
                </p>
                {(investor.city || investor.country) && (
                  <div className="flex items-center text-gray-600 mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{[investor.city, investor.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>
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
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Description */}
              {investor.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-600 leading-relaxed">{investor.description}</p>
                </div>
              )}

              {/* Investment Philosophy */}
              {investor.investmentPhilosophy && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Philosophy</h3>
                  <p className="text-gray-600 leading-relaxed">{investor.investmentPhilosophy}</p>
                </div>
              )}

              {/* Focus Areas */}
              {investor.focusAreas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Focus Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {investor.focusAreas.map((area, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Industries */}
              {investor.industries.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Industries</h3>
                  <div className="flex flex-wrap gap-2">
                    {investor.industries.map((industry, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{investor.contactEmail}</span>
                  </div>
                  {investor.contactPhone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{investor.contactPhone}</span>
                    </div>
                  )}
                  {investor.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-gray-400 mr-2" />
                      <a
                        href={investor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {investor.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Investment Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Investment Range:</span>
                    <span className="font-medium">{formatInvestmentRange(investor)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Ticket:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: investor.currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(investor.averageTicketSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Portfolio Size:</span>
                    <span className="font-medium">{investor.portfolioSize} companies</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Investments:</span>
                    <span className="font-medium">{investor.activeInvestments}</span>
                  </div>
                  {investor.timeToDecisionWeeks && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Decision Time:</span>
                      <span className="font-medium">{investor.timeToDecisionWeeks} weeks</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stage Preferences */}
              {investor.stagePreference.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Stage Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {investor.stagePreference.map((stage, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        {stage.replace('_', ' ').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Geographic Focus */}
              {investor.geographicFocus.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Geographic Focus</h3>
                  <div className="flex flex-wrap gap-2">
                    {investor.geographicFocus.map((region, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notable Exits */}
              {investor.notableExits.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Notable Exits</h3>
                  <div className="space-y-2">
                    {investor.notableExits.map((exit, index) => (
                      <div key={index} className="text-gray-600">• {exit}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{investor.responseRate}%</div>
                    <div className="text-sm text-blue-700">Response Rate</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{investor.investmentsMade}</div>
                    <div className="text-sm text-green-700">Investments Made</div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
                <div className="space-y-2">
                  {investor.acceptingPitches ? (
                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      Accepting Pitches
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      Not Accepting Pitches
                    </span>
                  )}
                  {investor.lastActive && (
                    <div className="text-sm text-gray-600 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Last active: {new Date(investor.lastActive).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Express Interest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorDirectory;