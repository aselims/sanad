import React, { useState } from 'react';
import { 
  Search, 
  Users, 
  Lightbulb, 
  Rocket, 
  Building, 
  GraduationCap, 
  DollarSign,
  ArrowRight,
  Globe,
  Target,
  Zap,
  Bot,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { performNormalSearch, performAISearch, SearchResults } from '../services/search';
import { Innovator, Collaboration } from '../types';

interface HomePageProps {
  onNavigateToWorkspace: () => void;
  onNavigateToCollaboration: (id: string) => void;
  onNavigateToChallenges?: () => void;
  onNavigateToPartnerships?: () => void;
  onNavigateToInnovators?: () => void;
  onNavigateToBlog?: () => void;
  onNavigateToHowItWorks?: () => void;
  onNavigateToSuccessStories?: () => void;
  onNavigateToFAQ?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToContactUs?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToCookies?: () => void;
}

export function HomePage({ 
  onNavigateToWorkspace, 
  onNavigateToCollaboration,
  onNavigateToChallenges = onNavigateToWorkspace,
  onNavigateToPartnerships = onNavigateToWorkspace,
  onNavigateToInnovators = onNavigateToWorkspace,
  onNavigateToBlog = onNavigateToWorkspace,
  onNavigateToHowItWorks = onNavigateToWorkspace,
  onNavigateToSuccessStories = onNavigateToWorkspace,
  onNavigateToFAQ = onNavigateToWorkspace,
  onNavigateToSupport = onNavigateToWorkspace,
  onNavigateToContactUs = onNavigateToWorkspace,
  onNavigateToTerms = onNavigateToWorkspace,
  onNavigateToPrivacy = onNavigateToWorkspace,
  onNavigateToCookies = onNavigateToWorkspace
}: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults>({ 
    innovators: [], 
    collaborations: [],
    aiResults: []
  });
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isAISearch, setIsAISearch] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      console.log(`Performing ${isAISearch ? 'AI' : 'normal'} search for: "${searchQuery}"`);
      
      // Use the appropriate search function based on the toggle state
      const results = isAISearch 
        ? await performAISearch(searchQuery)
        : await performNormalSearch(searchQuery);
      
      setSearchResults(results);
      
      // If no results found, show a message
      if (results.innovators.length === 0 && results.collaborations.length === 0 && 
          (!results.aiResults || results.aiResults.length === 0)) {
        setSearchError(`No results found for "${searchQuery}"`);
      }
    } catch (error) {
      console.error('Error during search:', error);
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Function to clear search results
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ innovators: [], collaborations: [], aiResults: [] });
    setSearchError(null);
  };
  
  // Check if there are any search results
  const hasSearchResults = searchResults.innovators.length > 0 || 
                          searchResults.collaborations.length > 0 || 
                          (searchResults.aiResults && searchResults.aiResults.length > 0);
  
  // Log the navigation functions to verify they exist
  console.log("HomePage navigation functions:", {
    onNavigateToWorkspace,
    onNavigateToCollaboration,
    onNavigateToChallenges,
    onNavigateToPartnerships,
    onNavigateToInnovators,
    onNavigateToBlog,
    onNavigateToHowItWorks,
    onNavigateToSuccessStories,
    onNavigateToFAQ,
    onNavigateToSupport,
    onNavigateToContactUs,
    onNavigateToTerms,
    onNavigateToPrivacy,
    onNavigateToCookies
  });

  // Function to toggle between normal and AI search
  const toggleSearchMode = () => {
    setIsAISearch(!isAISearch);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-blue-500 py-20">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Turn Ideas into Impact:<br />
              Connect, Collaborate, and Co-Create
            </h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
              Empowering innovators to find the right partners and bring ideas to life through collaboration.
            </p>
            
            {/* Search Mode Toggle */}
            <div className="flex justify-center mb-4">
              <button
                type="button"
                onClick={toggleSearchMode}
                className="flex items-center text-white bg-indigo-700 hover:bg-indigo-800 rounded-full px-4 py-2 transition-all duration-200"
              >
                {isAISearch ? (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">AI Chat Search</span>
                    <ToggleRight className="h-5 w-5 ml-2" />
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Normal Search</span>
                    <ToggleLeft className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isAISearch ? <Bot className="h-5 w-5 text-gray-400" /> : <Search className="h-5 w-5 text-gray-400" />}
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-4 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-lg text-gray-900 placeholder-gray-500"
                  placeholder={isAISearch 
                    ? "Ask a question like 'Find healthcare innovators in Dubai'" 
                    : "Search for startups, research projects, funding, or collaboration opportunities..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute inset-y-0 right-0 px-4 text-white bg-indigo-700 rounded-r-lg hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching...' : isAISearch ? 'Ask AI' : 'Search'}
                </button>
              </div>
            </form>
            
            {/* Search Results */}
            {(hasSearchResults || searchError) && (
              <div className="mt-8 bg-white rounded-lg shadow-xl p-6 text-left max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {hasSearchResults 
                      ? `Search Results for "${searchQuery}"` 
                      : `Search Results`}
                  </h2>
                  <button 
                    onClick={clearSearch}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear Results
                  </button>
                </div>
                
                {/* AI-specific results display */}
                {isAISearch && searchResults.aiResults && searchResults.aiResults.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Bot className="h-5 w-5 mr-2 text-indigo-600" />
                      AI-Enhanced Results
                    </h3>
                    
                    <div className="space-y-4">
                      {searchResults.aiResults.map((result) => (
                        <div 
                          key={`${result.type}-${result.id}`} 
                          className="border border-indigo-200 bg-indigo-50 rounded-lg p-4 hover:bg-indigo-100 transition-colors"
                        >
                          <div className="flex items-start">
                            <div className={`rounded-full p-2 mr-3 ${
                              result.type === 'user' 
                                ? 'bg-green-100 text-green-700' 
                                : result.type === 'challenge'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-blue-100 text-blue-700'
                            }`}>
                              {result.type === 'user' ? (
                                <Users className="h-5 w-5" />
                              ) : result.type === 'challenge' ? (
                                <Lightbulb className="h-5 w-5" />
                              ) : (
                                <Rocket className="h-5 w-5" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="text-md font-medium text-gray-900">
                                  {result.title || result.name}
                                </h4>
                                {result.relevanceScore && (
                                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                                    Relevance: {result.relevanceScore}
                                  </span>
                                )}
                              </div>
                              
                              <p className="mt-1 text-sm text-gray-600">{result.description}</p>
                              
                              {/* Highlights */}
                              {result.highlights && Object.keys(result.highlights).length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-gray-500 mb-1">Matched in:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(result.highlights).map(([field, values]) => (
                                      <span 
                                        key={field} 
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                                      >
                                        {field}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <button
                                onClick={() => {
                                  if (result.type === 'user') {
                                    // Navigate to innovator profile
                                    onNavigateToInnovators();
                                  } else {
                                    // Navigate to collaboration
                                    onNavigateToCollaboration(result.id);
                                  }
                                }}
                                className="mt-3 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                              >
                                View details
                                <ArrowRight className="ml-1 h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Innovators Results */}
                {searchResults.innovators.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Innovators ({searchResults.innovators.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.innovators.map(innovator => (
                        <div 
                          key={innovator.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition duration-150"
                          onClick={() => onNavigateToInnovators()}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              {innovator.type === 'startup' ? (
                                <Rocket className="h-6 w-6 text-indigo-600" />
                              ) : innovator.type === 'research' ? (
                                <GraduationCap className="h-6 w-6 text-indigo-600" />
                              ) : innovator.type === 'investor' ? (
                                <DollarSign className="h-6 w-6 text-indigo-600" />
                              ) : (
                                <Users className="h-6 w-6 text-indigo-600" />
                              )}
                            </div>
                            <div className="ml-4">
                              <h4 className="text-sm font-medium text-gray-900">{innovator.name}</h4>
                              <p className="text-sm text-gray-500 capitalize">{innovator.type}</p>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{innovator.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Collaborations Results */}
                {searchResults.collaborations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Collaborations ({searchResults.collaborations.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.collaborations.map(collaboration => (
                        <div 
                          key={collaboration.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition duration-150"
                          onClick={() => onNavigateToCollaboration(collaboration.id)}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              {collaboration.type === 'challenge' ? (
                                <Lightbulb className="h-6 w-6 text-indigo-600" />
                              ) : (
                                <Building className="h-6 w-6 text-indigo-600" />
                              )}
                            </div>
                            <div className="ml-4">
                              <h4 className="text-sm font-medium text-gray-900">{collaboration.title}</h4>
                              <p className="text-sm text-gray-500 capitalize">{collaboration.type}</p>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{collaboration.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* No Results Message */}
                {searchError && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{searchError}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={onNavigateToPartnerships}
                className="px-6 py-3 bg-white text-indigo-700 rounded-lg shadow-md hover:bg-gray-50 font-medium flex items-center"
              >
                <Users className="h-5 w-5 mr-2" />
                Find Partnerships
              </button>
              <button 
                onClick={onNavigateToChallenges}
                className="px-6 py-3 bg-indigo-800 text-white rounded-lg shadow-md hover:bg-indigo-900 font-medium flex items-center"
              >
                <Target className="h-5 w-5 mr-2" />
                Explore Challenges
              </button>
              <button 
                onClick={onNavigateToInnovators}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 font-medium flex items-center"
              >
                <Users className="h-5 w-5 mr-2" />
                Discover Innovators
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How SANAD Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A simple process to connect innovators, organizations, and resources to create impactful solutions together.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Lightbulb className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">1. Post or Find Opportunities</h3>
              <p className="text-gray-600 text-center">
                Share your innovation challenges or browse existing opportunities to find the perfect match for your expertise.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">2. Connect with Partners</h3>
              <p className="text-gray-600 text-center">
                Reach out to potential collaborators, discuss ideas, and form partnerships with the right stakeholders.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Rocket className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">3. Collaborate & Innovate</h3>
              <p className="text-gray-600 text-center">
                Work together in a structured environment with tools designed to help your collaboration succeed.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Collaboration Types */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Who Can Collaborate on SANAD</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform brings together diverse stakeholders to create powerful innovation ecosystems.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Startups</h3>
              <p className="text-gray-600 mb-4">
                Connect with resources, mentors, and organizations to scale your innovative solutions.
              </p>
              <button 
                onClick={onNavigateToWorkspace}
                className="text-indigo-600 font-medium flex items-center hover:text-indigo-800"
              >
                Learn more <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Researchers</h3>
              <p className="text-gray-600 mb-4">
                Find industry partners to apply your research and create real-world impact.
              </p>
              <button 
                onClick={onNavigateToWorkspace}
                className="text-indigo-600 font-medium flex items-center hover:text-indigo-800"
              >
                Learn more <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Investors</h3>
              <p className="text-gray-600 mb-4">
                Discover promising ventures and research projects with high growth potential.
              </p>
              <button 
                onClick={onNavigateToWorkspace}
                className="text-indigo-600 font-medium flex items-center hover:text-indigo-800"
              >
                Learn more <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Organizations</h3>
              <p className="text-gray-600 mb-4">
                Partner with innovators to solve challenges and drive digital transformation.
              </p>
              <button 
                onClick={onNavigateToWorkspace}
                className="text-indigo-600 font-medium flex items-center hover:text-indigo-800"
              >
                Learn more <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Collaborations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Collaborations</h2>
            <button 
              onClick={onNavigateToWorkspace}
              className="text-indigo-600 font-medium flex items-center hover:text-indigo-800"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Globe className="h-16 w-16 text-white opacity-75" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">Smart City Transportation Initiative</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Collaboration between the Ministry of Transport and local startups to implement AI-driven traffic management solutions.
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span>4 Participants</span>
                  <span className="mx-2">•</span>
                  <span>2 Open Positions</span>
                </div>
                <button 
                  onClick={() => onNavigateToCollaboration('1')}
                  className="block w-full text-center py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  View Details
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <Zap className="h-16 w-16 text-white opacity-75" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">Healthcare AI Research Partnership</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Proposed</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Joint research project to develop and validate AI algorithms for early disease detection.
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span>3 Participants</span>
                  <span className="mx-2">•</span>
                  <span>1 Open Position</span>
                </div>
                <button 
                  onClick={() => onNavigateToCollaboration('2')}
                  className="block w-full text-center py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  View Details
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                <Target className="h-16 w-16 text-white opacity-75" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">Renewable Energy Innovation</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Multi-stakeholder collaboration to develop new solar energy storage solutions.
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span>3 Participants</span>
                  <span className="mx-2">•</span>
                  <span>1 Open Position</span>
                </div>
                <button 
                  onClick={() => onNavigateToCollaboration('3')}
                  className="block w-full text-center py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why SANAD Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 shadow-xl">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-6">Why SANAD?</h2>
              
              <div className="mb-8">
                <p className="text-2xl font-semibold text-white mb-4">
                  95% of startups fail; Not because they lack good ideas, but because they lack the right connections.
                </p>
                <p className="text-xl text-indigo-100 mb-6">
                  SANAD helps startups, researchers, and businesses join forces, share resources, and discover synergies before wasting time and effort reinventing the wheel.
                </p>
                <p className="text-2xl font-bold text-white mt-8">
                  🚀 Why compete alone when you can build together?
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <button 
                  onClick={onNavigateToWorkspace}
                  className="px-8 py-4 bg-white text-indigo-700 rounded-lg shadow-md hover:bg-gray-50 font-medium text-lg transition-all duration-200 transform hover:scale-105"
                >
                  Create an Account
                </button>
                <button 
                  onClick={onNavigateToChallenges}
                  className="px-8 py-4 bg-indigo-800 text-white rounded-lg shadow-md hover:bg-indigo-900 font-medium text-lg transition-all duration-200 transform hover:scale-105"
                >
                  Browse Challenges
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">SANAD</h3>
              <p className="text-gray-400">
                Empowering collaboration and innovation across sectors to solve complex challenges.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Explore</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={onNavigateToPartnerships} className="hover:text-white">Partnerships</button></li>
                <li><button onClick={onNavigateToChallenges} className="hover:text-white">Challenges</button></li>
                <li><button onClick={onNavigateToInnovators} className="hover:text-white">Innovators</button></li>
                <li><button onClick={onNavigateToWorkspace} className="hover:text-white">About Us</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={onNavigateToHowItWorks} className="hover:text-white">How It Works</button></li>
                <li><button onClick={onNavigateToSuccessStories} className="hover:text-white">Success Stories</button></li>
                <li><button onClick={onNavigateToBlog} className="hover:text-white">Blog</button></li>
                <li><button onClick={onNavigateToFAQ} className="hover:text-white">FAQ</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:info@sanad.com" className="hover:text-white">info@sanad.com</a></li>
                <li><button onClick={onNavigateToSupport} className="hover:text-white">Support</button></li>
                <li><button onClick={onNavigateToContactUs} className="hover:text-white">Contact Us</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2023 SANAD. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button onClick={onNavigateToTerms} className="text-gray-400 hover:text-white">Terms</button>
              <button onClick={onNavigateToPrivacy} className="text-gray-400 hover:text-white">Privacy</button>
              <button onClick={onNavigateToCookies} className="text-gray-400 hover:text-white">Cookies</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 