import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { CollaborationList } from './components/CollaborationList';
import { CollaborationDetails } from './components/CollaborationDetails';
import { HomePage } from './components/HomePage';
import { InnovatorsList } from './components/InnovatorsList';
import { ProfilePage } from './components/ProfilePage';
import { Blog } from './components/Blog';
import AuthPage from './components/auth/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import type { Collaboration, Innovator } from './types';
import { getAllCollaborations } from './services/collaborations';
import { saveIdea } from './services/ideas';
import { getAllInnovators } from './services/innovators';
import { HowItWorks } from './components/HowItWorks';
import { SuccessStories } from './components/SuccessStories';
import { FAQ } from './components/FAQ';
import { Support } from './components/Support';
import { ContactUs } from './components/ContactUs';
import { LegalPage } from './components/LegalPages';
import { SearchResults } from './services/search';

export function App() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [selectedCollaboration, setSelectedCollaboration] = useState<string | null>(null);
  const [showHomePage, setShowHomePage] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'challenges' | 'partnerships' | 'ideas'>('all');
  const [activePage, setActivePage] = useState<'collaborations' | 'innovators' | 'profile' | 'blog'>('collaborations');
  const [selectedInnovator, setSelectedInnovator] = useState<string | null>(null);
  
  // State for API data
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [innovators, setInnovators] = useState<Innovator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add state for additional pages
  const [activeLegalPage, setActiveLegalPage] = useState<'terms' | 'privacy' | 'cookies' | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showSuccessStories, setShowSuccessStories] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);
  
  // Add state for search results
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [cameFromSearch, setCameFromSearch] = useState<boolean>(false);
  const [lastSearchQuery, setLastSearchQuery] = useState<string>('');

  // Add state for view mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [collaborationsData, innovatorsData] = await Promise.all([
          getAllCollaborations(),
          getAllInnovators()
        ]);
        
        setCollaborations(collaborationsData);
        setInnovators(innovatorsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter collaborations based on active filter
  const filteredCollaborations = collaborations.filter(collaboration => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'challenges' && collaboration.type === 'challenge') return true;
    if (activeFilter === 'partnerships' && collaboration.type === 'partnership') return true;
    if (activeFilter === 'ideas' && collaboration.type === 'idea') return true;
    return false;
  });

  // Add console logs to help debug the issue
  useEffect(() => {
    console.log('Collaborations state updated:', collaborations);
    console.log('Filtered collaborations:', filteredCollaborations);
    console.log('Active filter:', activeFilter);
    console.log('Show home page:', showHomePage);
    console.log('Active page:', activePage);
    console.log('Search results:', searchResults);
    console.log('Came from search:', cameFromSearch);
  }, [collaborations, filteredCollaborations, activeFilter, showHomePage, activePage, searchResults, cameFromSearch]);

  // Navigation functions
  const handleNavigateToWorkspace = () => {
    setShowHomePage(false);
    setActivePage('collaborations');
    setSelectedCollaboration(null);
    setSelectedInnovator(null);
    setCameFromSearch(false);
  };

  const handleNavigateToCollaboration = (id: string) => {
    setShowHomePage(false);
    setActivePage('collaborations');
    setSelectedCollaboration(id);
    // If navigating from search results, set the flag
    if (showHomePage && searchResults) {
      setCameFromSearch(true);
    }
  };

  const handleNavigateToChallenges = () => {
    setShowHomePage(false);
    setActivePage('collaborations');
    setActiveFilter('challenges');
    setCameFromSearch(false);
  };

  const handleNavigateToPartnerships = () => {
    setShowHomePage(false);
    setActivePage('collaborations');
    setActiveFilter('partnerships');
    setCameFromSearch(false);
  };

  const handleNavigateToIdeas = () => {
    setShowHomePage(false);
    setActivePage('collaborations');
    setActiveFilter('ideas');
    setCameFromSearch(false);
  };

  const handleNavigateToInnovators = () => {
    setShowHomePage(false);
    setActivePage('innovators');
    setSelectedCollaboration(null);
    setSelectedInnovator(null);
    setCameFromSearch(false);
  };

  const handleNavigateToProfile = () => {
    setShowHomePage(false);
    setActivePage('profile');
    setSelectedCollaboration(null);
    setSelectedInnovator(null);
    setCameFromSearch(false);
  };

  const handleNavigateToBlog = () => {
    setShowHomePage(false);
    setActivePage('blog');
    setSelectedCollaboration(null);
    setSelectedInnovator(null);
    setCameFromSearch(false);
  };

  const handleBackToHome = () => {
    setShowHomePage(true);
    setActivePage('collaborations');
    setSelectedCollaboration(null);
    setSelectedInnovator(null);
    setCameFromSearch(false);
  };

  const handleNavigateToAuth = () => {
    navigate('/auth');
  };

  const handleViewCollaboration = (id: string) => {
    setSelectedCollaboration(id);
  };

  const handleViewInnovator = (id: string) => {
    setSelectedInnovator(id);
  };

  // Add a function to handle back from collaboration details
  const handleBackFromCollaborationDetails = () => {
    if (cameFromSearch) {
      // If user came from search, go back to home page with search results
      setShowHomePage(true);
      setSelectedCollaboration(null);
    } else {
      // Otherwise, just clear the selected collaboration
      setSelectedCollaboration(null);
    }
  };

  // Add navigation functions for the new pages
  const handleNavigateToHome = () => {
    setShowHomePage(true);
    setActivePage('collaborations');
    setSelectedCollaboration(null);
    setSelectedInnovator(null);
    setActiveLegalPage(null);
    setShowHowItWorks(false);
    setShowSuccessStories(false);
    setShowFAQ(false);
    setShowSupport(false);
    setShowContactUs(false);
    setCameFromSearch(false);
  };

  const handleNavigateToHowItWorks = () => {
    setShowHomePage(false);
    setShowHowItWorks(true);
    setShowSuccessStories(false);
    setShowFAQ(false);
    setShowSupport(false);
    setShowContactUs(false);
    setActiveLegalPage(null);
    setCameFromSearch(false);
  };

  const handleNavigateToSuccessStories = () => {
    setShowHomePage(false);
    setShowHowItWorks(false);
    setShowSuccessStories(true);
    setShowFAQ(false);
    setShowSupport(false);
    setShowContactUs(false);
    setActiveLegalPage(null);
    setCameFromSearch(false);
  };

  const handleNavigateToFAQ = () => {
    setShowHomePage(false);
    setShowHowItWorks(false);
    setShowSuccessStories(false);
    setShowFAQ(true);
    setShowSupport(false);
    setShowContactUs(false);
    setActiveLegalPage(null);
    setCameFromSearch(false);
  };

  const handleNavigateToSupport = () => {
    setShowHomePage(false);
    setShowHowItWorks(false);
    setShowSuccessStories(false);
    setShowFAQ(false);
    setShowSupport(true);
    setShowContactUs(false);
    setActiveLegalPage(null);
    setCameFromSearch(false);
  };

  const handleNavigateToContactUs = () => {
    setShowHomePage(false);
    setShowHowItWorks(false);
    setShowSuccessStories(false);
    setShowFAQ(false);
    setShowSupport(false);
    setShowContactUs(true);
    setActiveLegalPage(null);
    setCameFromSearch(false);
  };

  const handleNavigateToLegalPage = (pageType: 'terms' | 'privacy' | 'cookies') => {
    setShowHomePage(false);
    setShowHowItWorks(false);
    setShowSuccessStories(false);
    setShowFAQ(false);
    setShowSupport(false);
    setShowContactUs(false);
    setActiveLegalPage(pageType);
    setCameFromSearch(false);
  };

  // Add a function to handle search results
  const handleSearchResults = (results: SearchResults, query: string) => {
    setSearchResults(results);
    setLastSearchQuery(query);
  };

  // Add a function to handle profile navigation by ID
  const handleNavigateToProfileById = (id: string) => {
    navigate(`/profile/${id}`);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage onSuccess={handleBackToHome} />} />
      
      {/* Add a specific route for profile/:id */}
      <Route path="/profile/:id" element={
        <>
          <Header 
            onNavigateToHome={handleNavigateToHome}
            onNavigateToWorkspace={handleNavigateToWorkspace}
            onNavigateToChallenges={handleNavigateToChallenges}
            onNavigateToPartnerships={handleNavigateToPartnerships}
            onNavigateToIdeas={handleNavigateToIdeas}
            onNavigateToInnovators={handleNavigateToInnovators}
            onNavigateToProfile={handleNavigateToProfile}
            onNavigateToAuth={handleNavigateToAuth}
          />
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          ) : (
            <ProfilePageWrapper innovators={innovators} />
          )}
        </>
      } />
      
      <Route path="/*" element={
        <>
          <Header 
            onNavigateToHome={handleNavigateToHome}
            onNavigateToWorkspace={handleNavigateToWorkspace}
            onNavigateToChallenges={handleNavigateToChallenges}
            onNavigateToPartnerships={handleNavigateToPartnerships}
            onNavigateToIdeas={handleNavigateToIdeas}
            onNavigateToInnovators={handleNavigateToInnovators}
            onNavigateToProfile={handleNavigateToProfile}
            onNavigateToAuth={handleNavigateToAuth}
          />
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          ) : showHomePage ? (
            <HomePage 
              onNavigateToWorkspace={handleNavigateToWorkspace}
              onNavigateToCollaboration={handleNavigateToCollaboration}
              onNavigateToChallenges={handleNavigateToChallenges}
              onNavigateToPartnerships={handleNavigateToPartnerships}
              onNavigateToIdeas={handleNavigateToIdeas}
              onNavigateToInnovators={handleNavigateToInnovators}
              onNavigateToProfileById={handleNavigateToProfileById}
              onNavigateToBlog={handleNavigateToBlog}
              onNavigateToHowItWorks={handleNavigateToHowItWorks}
              onNavigateToSuccessStories={handleNavigateToSuccessStories}
              onNavigateToFAQ={handleNavigateToFAQ}
              onNavigateToSupport={handleNavigateToSupport}
              onNavigateToContactUs={handleNavigateToContactUs}
              onNavigateToTerms={() => handleNavigateToLegalPage('terms')}
              onNavigateToPrivacy={() => handleNavigateToLegalPage('privacy')}
              onNavigateToCookies={() => handleNavigateToLegalPage('cookies')}
              onSearchResults={handleSearchResults}
              searchResults={searchResults}
              lastSearchQuery={lastSearchQuery}
            />
          ) : showHowItWorks ? (
            <HowItWorks onBack={handleNavigateToHome} />
          ) : showSuccessStories ? (
            <SuccessStories onBack={handleNavigateToHome} />
          ) : showFAQ ? (
            <FAQ onBack={handleNavigateToHome} />
          ) : showSupport ? (
            <Support onBack={handleNavigateToHome} />
          ) : showContactUs ? (
            <ContactUs onBack={handleNavigateToHome} />
          ) : activeLegalPage ? (
            <LegalPage onBack={handleNavigateToHome} pageType={activeLegalPage} />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {activePage === 'collaborations' && !selectedCollaboration && (
                <>
                  <WorkspaceHeader 
                    onCreateCollaboration={(collaboration) => {
                      // Handle collaboration creation
                      console.log('Creating collaboration:', collaboration);
                      
                      // Create a new collaboration with required fields and a unique ID
                      const newCollaboration: Collaboration = {
                        id: `collab-${Date.now()}`, // Generate a unique ID
                        title: collaboration.title || 'New Collaboration',
                        description: collaboration.description || '',
                        participants: user && user.firstName && user.lastName 
                          ? [`${user.firstName} ${user.lastName}`, ...(collaboration.participants || [])]
                          : user?.name 
                            ? [user.name, ...(collaboration.participants || [])]
                            : collaboration.participants || [],
                        status: collaboration.status || 'proposed',
                        type: collaboration.type || 'partnership',
                        createdAt: new Date(),
                        updatedAt: new Date()
                      };
                      
                      // Add type-specific details if they exist
                      if (collaboration.type === 'challenge' && collaboration.challengeDetails) {
                        newCollaboration.challengeDetails = collaboration.challengeDetails;
                      } else if (collaboration.type === 'idea' && collaboration.ideaDetails) {
                        newCollaboration.ideaDetails = collaboration.ideaDetails;
                        // Save idea to backend (with local storage fallback)
                        saveIdea(newCollaboration)
                          .then(() => {
                            console.log('Idea saved successfully');
                          })
                          .catch(error => {
                            console.error('Error saving idea:', error);
                          });
                      } else if (collaboration.partnershipDetails) {
                        newCollaboration.partnershipDetails = collaboration.partnershipDetails;
                      }
                      
                      // Add the new collaboration to the state
                      setCollaborations(prevCollaborations => [...prevCollaborations, newCollaboration]);
                      
                      // Navigate to the collaborations page to show the new collaboration
                      setShowHomePage(false);
                      setActivePage('collaborations');
                      
                      // Set the appropriate filter based on the collaboration type
                      if (collaboration.type === 'challenge') {
                        setActiveFilter('challenges');
                      } else if (collaboration.type === 'idea') {
                        setActiveFilter('ideas');
                      } else {
                        setActiveFilter('partnerships');
                      }
                    }}
                    onFilterChange={setActiveFilter}
                    activeFilter={activeFilter}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                  />
                  <CollaborationList 
                    collaborations={filteredCollaborations} 
                    onViewDetails={handleNavigateToCollaboration}
                    viewMode={viewMode}
                  />
                </>
              )}
              
              {activePage === 'collaborations' && selectedCollaboration && (
                <CollaborationDetails 
                  collaboration={collaborations.find(c => c.id === selectedCollaboration)!}
                  onBack={handleBackFromCollaborationDetails}
                  cameFromSearch={cameFromSearch}
                />
              )}
              
              {activePage === 'innovators' && !selectedInnovator && (
                <InnovatorsList 
                  innovators={innovators}
                  onViewProfile={handleViewInnovator}
                />
              )}
              
              {activePage === 'innovators' && selectedInnovator && (
                <ProfilePage 
                  user={innovators.find(i => i.id === selectedInnovator)!}
                />
              )}
              
              {activePage === 'profile' && (
                <ProtectedRoute>
                  <ProfilePage 
                    user={{
                      id: user?.id || 'current-user',
                      name: user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.name || 'User',
                      type: user?.role as 'individual' || 'individual',
                      organization: user?.organization || 'Saned Platform',
                      description: user?.bio || 'Saned Platform user',
                      email: user?.email || '',
                      expertise: user?.expertise || [],
                      tags: user?.interests || ['Sustainable Development', 'Digital Transformation'],
                      position: user?.position || ''
                    }}
                  />
                </ProtectedRoute>
              )}
              
              {activePage === 'blog' && (
                <Blog onNavigateBack={handleBackToHome} />
              )}
            </div>
          )}
        </>
      } />
    </Routes>
  );
}

// Create a wrapper component to handle the profile page with URL params
function ProfilePageWrapper({ innovators }: { innovators: Innovator[] }) {
  const navigate = useNavigate();
  const location = window.location.pathname;
  const id = location.split('/profile/')[1];
  
  // Find the innovator by ID
  const innovator = innovators.find(i => i.id === id);
  
  if (!innovator) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Profile not found. <button 
            onClick={() => navigate('/')}
            className="underline text-indigo-600 hover:text-indigo-800"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }
  
  return <ProfilePage user={innovator} />;
}

export default App;