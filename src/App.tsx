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
import { getAllInnovators } from './services/innovators';
import { HowItWorks } from './components/HowItWorks';
import { SuccessStories } from './components/SuccessStories';
import { FAQ } from './components/FAQ';
import { Support } from './components/Support';
import { ContactUs } from './components/ContactUs';
import { LegalPage } from './components/LegalPages';

export function App() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [selectedCollaboration, setSelectedCollaboration] = useState<string | null>(null);
  const [showHomePage, setShowHomePage] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'challenges' | 'partnerships'>('all');
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
    return false;
  });

  // Add console logs to help debug the issue
  useEffect(() => {
    console.log('Collaborations state updated:', collaborations);
    console.log('Filtered collaborations:', filteredCollaborations);
    console.log('Active filter:', activeFilter);
    console.log('Show home page:', showHomePage);
    console.log('Active page:', activePage);
  }, [collaborations, filteredCollaborations, activeFilter, showHomePage, activePage]);

  // Navigation functions
  const handleNavigateToWorkspace = () => {
    setShowHomePage(false);
    setActivePage('collaborations');
    setSelectedCollaboration(null);
    setSelectedInnovator(null);
  };

  const handleNavigateToCollaboration = (id: string) => {
    setShowHomePage(false);
    setActivePage('collaborations');
    setSelectedCollaboration(id);
  };

  const handleNavigateToChallenges = () => {
    setShowHomePage(false);
    setActivePage('collaborations');
    setActiveFilter('challenges');
  };

  const handleNavigateToPartnerships = () => {
    setShowHomePage(false);
    setActivePage('collaborations');
    setActiveFilter('partnerships');
  };

  const handleNavigateToInnovators = () => {
    setShowHomePage(false);
    setActivePage('innovators');
    setSelectedCollaboration(null);
    setSelectedInnovator(null);
  };

  const handleNavigateToProfile = () => {
    setShowHomePage(false);
    setActivePage('profile');
    setSelectedCollaboration(null);
    setSelectedInnovator(null);
  };

  const handleNavigateToBlog = () => {
    setShowHomePage(false);
    setActivePage('blog');
    setSelectedCollaboration(null);
    setSelectedInnovator(null);
  };

  const handleBackToHome = () => {
    setShowHomePage(true);
    setActivePage('collaborations');
    setSelectedCollaboration(null);
    setSelectedInnovator(null);
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
  };

  const handleNavigateToHowItWorks = () => {
    setShowHomePage(false);
    setShowHowItWorks(true);
    setShowSuccessStories(false);
    setShowFAQ(false);
    setShowSupport(false);
    setShowContactUs(false);
    setActiveLegalPage(null);
  };

  const handleNavigateToSuccessStories = () => {
    setShowHomePage(false);
    setShowHowItWorks(false);
    setShowSuccessStories(true);
    setShowFAQ(false);
    setShowSupport(false);
    setShowContactUs(false);
    setActiveLegalPage(null);
  };

  const handleNavigateToFAQ = () => {
    setShowHomePage(false);
    setShowHowItWorks(false);
    setShowSuccessStories(false);
    setShowFAQ(true);
    setShowSupport(false);
    setShowContactUs(false);
    setActiveLegalPage(null);
  };

  const handleNavigateToSupport = () => {
    setShowHomePage(false);
    setShowHowItWorks(false);
    setShowSuccessStories(false);
    setShowFAQ(false);
    setShowSupport(true);
    setShowContactUs(false);
    setActiveLegalPage(null);
  };

  const handleNavigateToContactUs = () => {
    setShowHomePage(false);
    setShowHowItWorks(false);
    setShowSuccessStories(false);
    setShowFAQ(false);
    setShowSupport(false);
    setShowContactUs(true);
    setActiveLegalPage(null);
  };

  const handleNavigateToLegalPage = (pageType: 'terms' | 'privacy' | 'cookies') => {
    setShowHomePage(false);
    setShowHowItWorks(false);
    setShowSuccessStories(false);
    setShowFAQ(false);
    setShowSupport(false);
    setShowContactUs(false);
    setActiveLegalPage(pageType);
  };

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/*" element={
        <>
          <Header 
            onNavigateToHome={handleNavigateToHome}
            onNavigateToWorkspace={handleNavigateToWorkspace}
            onNavigateToChallenges={handleNavigateToChallenges}
            onNavigateToPartnerships={handleNavigateToPartnerships}
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
              onNavigateToInnovators={handleNavigateToInnovators}
              onNavigateToBlog={handleNavigateToBlog}
              onNavigateToHowItWorks={handleNavigateToHowItWorks}
              onNavigateToSuccessStories={handleNavigateToSuccessStories}
              onNavigateToFAQ={handleNavigateToFAQ}
              onNavigateToSupport={handleNavigateToSupport}
              onNavigateToContactUs={handleNavigateToContactUs}
              onNavigateToTerms={() => handleNavigateToLegalPage('terms')}
              onNavigateToPrivacy={() => handleNavigateToLegalPage('privacy')}
              onNavigateToCookies={() => handleNavigateToLegalPage('cookies')}
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
                        participants: collaboration.participants || [],
                        status: collaboration.status || 'proposed',
                        type: collaboration.type || 'partnership',
                        createdAt: new Date(),
                        updatedAt: new Date()
                      };
                      
                      // Add type-specific details if they exist
                      if (collaboration.type === 'challenge' && collaboration.challengeDetails) {
                        newCollaboration.challengeDetails = collaboration.challengeDetails;
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
                      } else {
                        setActiveFilter('partnerships');
                      }
                    }}
                  />
                  <CollaborationList 
                    collaborations={filteredCollaborations} 
                    onViewDetails={handleNavigateToCollaboration}
                  />
                </>
              )}
              
              {activePage === 'collaborations' && selectedCollaboration && (
                <CollaborationDetails 
                  collaboration={collaborations.find(c => c.id === selectedCollaboration)!}
                  onBack={() => setSelectedCollaboration(null)}
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
                      organization: user?.organization || 'SANAD Platform',
                      description: user?.bio || 'SANAD Platform user',
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

export default App;