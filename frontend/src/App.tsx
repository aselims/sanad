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
import { saveIdea, createIdea } from './services/ideas';
import { getAllInnovators } from './services/innovators';
import { HowItWorks } from './components/HowItWorks';
import { SuccessStories } from './components/SuccessStories';
import { FAQ } from './components/FAQ';
import { Support } from './components/Support';
import { ContactUs } from './components/ContactUs';
import { LegalPage } from './components/LegalPages';
import { SearchResults } from './services/search';
import { Footer } from './components/Footer';
import MessagesPage from './components/MessagesPage';
import { getPotentialMatches, getMatchRequests } from './services/matches';
import { createChallenge } from './services/challenges';
import { createPartnership } from './services/partnerships';
import { performNormalSearch } from './services/search';

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
    navigate('/workspace');
  };

  const handleNavigateToCollaboration = (id: string) => {
    navigate(`/collaboration/${id}`);
  };

  const handleNavigateToChallenges = () => {
    navigate('/workspace');
    setActiveFilter('challenges');
  };

  const handleNavigateToPartnerships = () => {
    navigate('/workspace');
    setActiveFilter('partnerships');
  };

  const handleNavigateToIdeas = () => {
    navigate('/workspace');
    setActiveFilter('ideas');
  };

  const handleNavigateToInnovators = () => {
    navigate('/innovators');
  };

  const handleNavigateToProfile = () => {
    if (user) {
      navigate(`/profile/${user.id}`);
    } else {
      navigate('/auth');
    }
  };

  const handleNavigateToBlog = () => {
    navigate('/blog');
  };

  const handleNavigateToConnections = () => {
    if (user) {
      navigate(`/profile/${user.id}?tab=connections`);
    } else {
      navigate('/auth');
    }
  };

  const handleNavigateToCollaborations = () => {
    if (user) {
      navigate(`/profile/${user.id}?tab=collaborations`);
    } else {
      navigate('/auth');
    }
  };

  const handleNavigateToMessages = () => {
    if (user) {
      navigate(`/profile/${user.id}?tab=messages`);
    } else {
      navigate('/auth');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleNavigateToAuth = () => {
    navigate('/auth');
  };

  const handleViewCollaboration = (id: string) => {
    navigate(`/collaboration/${id}`);
  };

  const handleViewInnovator = (id: string) => {
    navigate(`/profile/${id}`);
  };

  // Add a function to handle back from collaboration details
  const handleBackFromCollaborationDetails = () => {
    navigate(-1);
  };

  // Add navigation functions for the new pages
  const handleNavigateToHome = () => {
    navigate('/');
  };

  const handleNavigateToHowItWorks = () => {
    navigate('/how-it-works');
  };

  const handleNavigateToSuccessStories = () => {
    navigate('/success-stories');
  };

  const handleNavigateToFAQ = () => {
    navigate('/faq');
  };

  const handleNavigateToSupport = () => {
    navigate('/support');
  };

  const handleNavigateToContactUs = () => {
    navigate('/contact');
  };

  const handleNavigateToLegalPage = (pageType: 'terms' | 'privacy' | 'cookies') => {
    navigate(`/legal/${pageType}`);
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

  // Add a function to handle search from the workspace page
  const handleWorkspaceSearch = (query: string) => {
    console.log('Workspace search for:', query);
    // You can add additional logic here if needed
  };

  // Add a function to handle collaboration creation
  const handleCreateCollaboration = async (newCollaboration: Partial<Collaboration>) => {
    console.log('Creating new collaboration:', newCollaboration);
    
    try {
      let createdCollaboration: Collaboration | null = null;
      
      // Call the appropriate service function based on collaboration type
      if (newCollaboration.type === 'challenge') {
        // Convert collaboration to challenge format
        const challengeData = {
          title: newCollaboration.title || '',
          description: newCollaboration.description || '',
          organization: (newCollaboration.participants && newCollaboration.participants.length > 0) ? 
            newCollaboration.participants[0] : 'Unknown Organization',
          status: newCollaboration.status === 'proposed' ? 'open' : 
                 newCollaboration.status === 'active' ? 'in-progress' : 'completed' as 'open' | 'in-progress' | 'completed',
          deadline: newCollaboration.challengeDetails?.deadline,
          reward: newCollaboration.challengeDetails?.reward,
          eligibilityCriteria: newCollaboration.challengeDetails?.eligibilityCriteria
        };
        
        const createdChallenge = await createChallenge(challengeData);
        // Convert the response back to a collaboration
        createdCollaboration = {
          id: createdChallenge.id,
          title: createdChallenge.title,
          participants: [createdChallenge.organization],
          status: createdChallenge.status === 'open' ? 'proposed' : 
                 createdChallenge.status === 'in-progress' ? 'active' : 'completed',
          description: createdChallenge.description,
          type: 'challenge',
          challengeDetails: {
            deadline: createdChallenge.deadline || '',
            reward: createdChallenge.reward || '',
            eligibilityCriteria: createdChallenge.eligibilityCriteria || ''
          },
          createdAt: createdChallenge.createdAt,
          updatedAt: createdChallenge.updatedAt
        };
      } 
      else if (newCollaboration.type === 'partnership') {
        createdCollaboration = await createPartnership(newCollaboration);
      } 
      else if (newCollaboration.type === 'idea') {
        createdCollaboration = await createIdea(newCollaboration);
      }
      
      if (createdCollaboration) {
        // Add the new collaboration to the state
        setCollaborations(prevCollaborations => [createdCollaboration!, ...prevCollaborations]);
        console.log('Successfully created and added collaboration to state');
      } else {
        console.error('Failed to create collaboration: no collaboration was returned');
      }
    } catch (error) {
      console.error('Error creating collaboration:', error);
      
      // Generate a temporary ID as fallback - this ensures UI still shows something even if API call fails
      const tempId = `temp-${Date.now()}`;
      
      // Create a full collaboration object from the partial one as fallback
      const fallbackCollaboration: Collaboration = {
        id: tempId,
        title: newCollaboration.title || 'Untitled Collaboration',
        description: newCollaboration.description || '',
        participants: newCollaboration.participants || [],
        status: newCollaboration.status || 'proposed',
        type: newCollaboration.type || 'partnership',
        createdAt: new Date(),
        updatedAt: new Date(),
        // Include type-specific details
        ...(newCollaboration.challengeDetails && { challengeDetails: newCollaboration.challengeDetails }),
        ...(newCollaboration.partnershipDetails && { partnershipDetails: newCollaboration.partnershipDetails }),
        ...(newCollaboration.ideaDetails && { ideaDetails: newCollaboration.ideaDetails }),
      };
      
      // Add the fallback collaboration to the state
      setCollaborations(prevCollaborations => [fallbackCollaboration, ...prevCollaborations]);
      console.log('Added fallback collaboration to state due to API error');
    }
  };

  // Add an effect to handle search parameters from URL
  useEffect(() => {
    // Check if there's a search query in URL
    const url = new URL(window.location.href);
    const searchParam = url.searchParams.get('search');
    
    if (searchParam) {
      // If there's a search query but no results, perform the search
      if (!searchResults && searchParam.trim() !== '') {
        console.log('Found search param in URL:', searchParam);
        // Perform search
        const doSearch = async () => {
          try {
            const results = await performNormalSearch(searchParam);
            setSearchResults(results);
            setLastSearchQuery(searchParam);
          } catch (error) {
            console.error('Error performing search from URL param:', error);
          }
        };
        doSearch();
      }
    }
  }, [searchResults]);

  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/*" element={
          <Header 
            onNavigateToWorkspace={handleNavigateToWorkspace}
            onNavigateToChallenges={handleNavigateToChallenges}
            onNavigateToPartnerships={handleNavigateToPartnerships}
            onNavigateToIdeas={handleNavigateToIdeas}
            onNavigateToInnovators={handleNavigateToInnovators}
            onNavigateToHome={handleNavigateToHome}
            onNavigateToProfile={handleNavigateToProfile}
            onNavigateToAuth={handleNavigateToAuth}
            onNavigateToHowItWorks={handleNavigateToHowItWorks}
            onNavigateToSuccessStories={handleNavigateToSuccessStories}
            onNavigateToFAQ={handleNavigateToFAQ}
            onNavigateToSupport={handleNavigateToSupport}
            onNavigateToContactUs={handleNavigateToContactUs}
            onNavigateToLegalPage={handleNavigateToLegalPage}
            onNavigateToConnections={handleNavigateToConnections}
            onNavigateToCollaborations={handleNavigateToCollaborations}
            onNavigateToMessages={handleNavigateToMessages}
            onSearchResults={handleSearchResults}
            isAuthenticated={isAuthenticated}
          />
        } />
      </Routes>
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={
            <HomePage 
              onNavigateToWorkspace={handleNavigateToWorkspace}
              onNavigateToCollaboration={handleNavigateToCollaboration}
              onNavigateToChallenges={handleNavigateToChallenges}
              onNavigateToPartnerships={handleNavigateToPartnerships}
              onNavigateToIdeas={handleNavigateToIdeas}
              onNavigateToInnovators={handleNavigateToInnovators}
              onNavigateToProfileById={(id) => navigate(`/profile/${id}`)}
              searchResults={searchResults || { innovators: [], collaborations: [], aiResults: [] }}
              lastSearchQuery={lastSearchQuery}
              onSearchResults={handleSearchResults}
            />
          } />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/workspace" element={
            <div className="bg-gray-50 min-h-screen">
              <WorkspaceHeader 
                onCreateCollaboration={handleCreateCollaboration}
                activeFilter={activeFilter}
                onFilterChange={(filter) => setActiveFilter(filter as 'all' | 'challenges' | 'partnerships' | 'ideas')}
                onSearch={handleWorkspaceSearch}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                onSearchResults={handleSearchResults}
                onNavigateToHome={handleNavigateToHome}
                onNavigateToProfile={handleNavigateToProfile}
                onNavigateToAuth={handleNavigateToAuth}
              />
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <CollaborationList 
                  collaborations={filteredCollaborations}
                  onViewDetails={handleViewCollaboration}
                  viewMode={viewMode}
                />
              </div>
            </div>
          } />
          
          <Route path="/collaboration/:id" element={
            <CollaborationDetails 
              collaboration={collaborations.find(c => c.id === window.location.pathname.split('/collaboration/')[1]) || {
                id: '',
                title: 'Collaboration not found',
                description: 'This collaboration does not exist or has been removed.',
                participants: [],
                status: 'completed',
                createdAt: new Date(),
                updatedAt: new Date()
              }}
              onBack={() => navigate(-1)}
              cameFromSearch={false}
            />
          } />
          
          <Route path="/how-it-works" element={<HowItWorks onBack={() => navigate(-1)} />} />
          <Route path="/success-stories" element={<SuccessStories onBack={() => navigate(-1)} />} />
          <Route path="/faq" element={<FAQ onBack={() => navigate(-1)} />} />
          <Route path="/support" element={<Support onBack={() => navigate(-1)} />} />
          <Route path="/contact" element={<ContactUs onBack={() => navigate(-1)} />} />
          <Route path="/legal/:page" element={
            <LegalPage 
              onBack={() => navigate(-1)} 
              pageType={window.location.pathname.split('/legal/')[1] as 'terms' | 'privacy' | 'cookies'}
            />
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              {user ? <ProfilePageWrapper innovators={innovators} onBack={() => navigate(-1)} /> : null}
            </ProtectedRoute>
          } />
          <Route path="/profile/:id" element={<ProfilePageWrapper innovators={innovators} onBack={() => navigate(-1)} />} />
          
          {/* Add new routes for messages */}
          <Route path="/messages" element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          } />
          <Route path="/messages/:userId" element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          } />
          <Route path="/innovators" element={
            <div className="bg-gray-50 min-h-screen p-6">
              <InnovatorsList 
                innovators={innovators}
                onViewProfile={handleViewInnovator}
              />
            </div>
          } />
        </Routes>
      </main>
      
      <Footer 
        onNavigateToTerms={() => navigate('/legal/terms')}
        onNavigateToPrivacy={() => navigate('/legal/privacy')}
        onNavigateToCookies={() => navigate('/legal/cookies')}
        onNavigateToContactUs={() => navigate('/contact')}
        onNavigateToFAQ={() => navigate('/faq')}
      />
    </div>
  );
}

// Create a wrapper component to handle the profile page with URL params
function ProfilePageWrapper({ innovators, onBack }: { innovators: Innovator[], onBack: () => void }) {
  const navigate = useNavigate();
  const location = window.location.pathname;
  const { user: currentUser } = useAuth();
  
  // Get ID from URL or use current user's ID
  let id: string | undefined;
  if (location.includes('/profile/')) {
    id = location.split('/profile/')[1];
  } else if (currentUser) {
    id = currentUser.id;
  }
  
  const [matchRequests, setMatchRequests] = useState<any[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<Innovator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Find the innovator by ID
  const innovator = id ? innovators.find(i => i.id === id) : undefined;
  
  // If no ID or innovator not found but user is logged in, use current user
  const userToDisplay = innovator || (currentUser ? currentUser as unknown as Innovator : undefined);
  
  // Fetch match requests and potential matches if this is the current user's profile
  useEffect(() => {
    const fetchProfileData = async () => {
      if (currentUser && id && currentUser.id === id) {
        setIsLoading(true);
        try {
          const [matchRequestsData, potentialMatchesData] = await Promise.all([
            getMatchRequests(id),
            getPotentialMatches(id)
          ]);
          
          setMatchRequests(matchRequestsData);
          setPotentialMatches(potentialMatchesData);
        } catch (error) {
          console.error('Error fetching profile data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchProfileData();
  }, [currentUser, id]);
 
  if (!userToDisplay) {
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
  
  return (
    <ProfilePage 
      user={userToDisplay} 
      onBack={onBack} 
      matchRequests={matchRequests}
      potentialMatches={potentialMatches}
    />
  );
}

export default App;