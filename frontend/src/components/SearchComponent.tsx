import React, { useState, useRef, useEffect } from 'react';
import { Search, Bot, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { performNormalSearch, performAISearch, SearchResults } from '../services/search';

interface SearchComponentProps {
  onSearchResults: (results: SearchResults, query: string) => void;
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
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when opened
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Close when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle pressing Escape key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const results = isAISearch
        ? await performAISearch(searchQuery)
        : await performNormalSearch(searchQuery);
      
      onSearchResults(results, searchQuery);
      onClose(); // Close after search
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSearchMode = () => {
    setIsAISearch(!isAISearch);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        ref={searchRef}
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all"
      >
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
      </div>
    </div>
  );
} 