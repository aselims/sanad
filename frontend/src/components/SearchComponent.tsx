import React, { useState, useRef, useEffect } from 'react';
import { Search, Bot, X, ToggleLeft, ToggleRight, User, Briefcase, Handshake, Lightbulb, ArrowUpRight, AlertCircle } from 'lucide-react';
import { performNormalSearch, performAISearch, SearchResults } from '../services/search';
import { Link } from 'react-router-dom';

interface SearchComponentProps {
  onSearchResults?: (results: SearchResults, query: string) => void;
  initialQuery?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchComponent({ 
  onSearchResults, 
  initialQuery = '',
  isOpen,
  onClose
}: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [isAISearch, setIsAISearch] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when opened
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset results when modal is closed
    if (!isOpen) {
      setShowResults(false);
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    // Close when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (showResults) {
          // If showing results, only close results view
          setShowResults(false);
        } else {
          // Otherwise close the whole search modal
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, showResults]);

  // Handle pressing Escape key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showResults) {
          // If showing results, first go back to search
          setShowResults(false);
        } else {
          // Otherwise close the whole modal
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose, showResults]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const searchResults = isAISearch
        ? await performAISearch(searchQuery)
        : await performNormalSearch(searchQuery);
      
      setResults(searchResults);
      setShowResults(true);
      
      // Also call the callback if provided (for backward compatibility)
      if (onSearchResults) {
        onSearchResults(searchResults, searchQuery);
      }
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSearchMode = () => {
    setIsAISearch(!isAISearch);
  };

  const handleBackToSearch = () => {
    setShowResults(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        ref={searchRef}
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all"
      >
        {!showResults ? (
          // Search Form
          <>
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-blue-500 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">
                {isAISearch ? 'AI-Powered Search' : 'Search'}
              </h3>
              <button 
                onClick={onClose}
                className="text-white hover:text-indigo-100 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <button
                  type="button"
                  onClick={toggleSearchMode}
                  className="flex items-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full px-4 py-2 transition-all duration-200"
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
              
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isAISearch ? <Bot className="h-5 w-5 text-gray-400" /> : <Search className="h-5 w-5 text-gray-400" />}
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder={isAISearch 
                      ? "Ask a question like 'Find healthcare innovators in Dubai'" 
                      : "Search for startups, research projects, funding, or collaboration opportunities..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="absolute inset-y-0 right-0 px-4 text-white bg-indigo-600 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isSearching}
                  >
                    {isSearching ? 'Searching...' : isAISearch ? 'Ask AI' : 'Search'}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          // Search Results
          <>
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-blue-500 flex justify-between items-center">
              <div className="flex items-center">
                <button 
                  onClick={handleBackToSearch}
                  className="text-white hover:text-indigo-100 focus:outline-none mr-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-medium text-white">
                  Search Results for "{searchQuery}"
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="text-white hover:text-indigo-100 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[70vh]">
              {/* Innovators Results */}
              {results && results.innovators.length > 0 && (
                <div className="p-4 border-b">
                  <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-indigo-600" />
                    Innovators ({results.innovators.length})
                  </h4>
                  <div className="space-y-3">
                    {results.innovators.slice(0, 5).map(innovator => (
                      <Link 
                        key={innovator.id}
                        to={`/profile/${innovator.id}`}
                        onClick={onClose}
                        className="block p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-900">{innovator.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{innovator.organization} • {innovator.position}</p>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-indigo-600" />
                        </div>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{innovator.description}</p>
                      </Link>
                    ))}
                    {results.innovators.length > 5 && (
                      <Link
                        to={`/?search=${encodeURIComponent(searchQuery)}`}
                        onClick={onClose}
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center w-full mt-2 py-2"
                      >
                        View all {results.innovators.length} innovators
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Collaborations Results */}
              {results && results.collaborations.length > 0 && (
                <div className="p-4 border-b">
                  <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-indigo-600" />
                    Collaborations ({results.collaborations.length})
                  </h4>
                  <div className="space-y-3">
                    {results.collaborations.slice(0, 5).map(collab => (
                      <Link 
                        key={collab.id}
                        to={`/collaboration/${collab.id}`}
                        onClick={onClose}
                        className="block p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            {collab.type === 'challenge' && <Briefcase className="h-4 w-4 mr-2 text-blue-600" />}
                            {collab.type === 'partnership' && <Handshake className="h-4 w-4 mr-2 text-green-600" />}
                            {collab.type === 'idea' && <Lightbulb className="h-4 w-4 mr-2 text-amber-600" />}
                            <h5 className="font-medium text-gray-900">{collab.title}</h5>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-indigo-600" />
                        </div>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{collab.description}</p>
                      </Link>
                    ))}
                    {results.collaborations.length > 5 && (
                      <Link
                        to={`/?search=${encodeURIComponent(searchQuery)}`}
                        onClick={onClose}
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center w-full mt-2 py-2"
                      >
                        View all {results.collaborations.length} collaborations
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* No results message */}
              {results && results.innovators.length === 0 && results.collaborations.length === 0 && (
                <div className="p-8 text-center">
                  <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No results found</h4>
                  <p className="text-gray-600">
                    We couldn't find any matches for "{searchQuery}".
                    Try using different keywords or checking for spelling errors.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 