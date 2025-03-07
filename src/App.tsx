import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { CollaborationList } from './components/CollaborationList';
import { CollaborationDetails } from './components/CollaborationDetails';
import { HomePage } from './components/HomePage';
import { InnovatorsList } from './components/InnovatorsList';
import { ProfilePage } from './components/ProfilePage';
import AuthPage from './components/auth/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import type { Collaboration, Innovator } from './types';

export function App() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [selectedCollaboration, setSelectedCollaboration] = useState<string | null>(null);
  const [showHomePage, setShowHomePage] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'challenges' | 'partnerships'>('all');
  const [activePage, setActivePage] = useState<'collaborations' | 'innovators' | 'profile'>('collaborations');
  const [selectedInnovator, setSelectedInnovator] = useState<string | null>(null);
  
  // Sample collaborations data
  const [collaborations, setCollaborations] = useState<Collaboration[]>([
    {
      id: '1',
      title: 'Smart City Transportation Initiative',
      description: 'Collaboration between the Ministry of Transport and local startups to implement AI-driven traffic management solutions.',
      participants: ['Ministry of Transport', 'TechStart Inc.', 'Urban Planning Institute'],
      status: 'active',
      challengeId: '1',
      type: 'challenge'
    },
    {
      id: '2',
      title: 'Healthcare AI Research Partnership',
      description: 'Joint research initiative between universities and healthcare providers to develop AI solutions for early disease detection.',
      participants: ['National University', 'Central Hospital', 'AI Health Solutions'],
      status: 'active',
      type: 'partnership'
    }
  ]);

  // Sample innovators data
  const [innovators, setInnovators] = useState<Innovator[]>([
    {
      id: '1',
      name: 'Dr. Sarah Ahmed',
      organization: 'National University',
      type: 'research',
      expertise: ['AI', 'Machine Learning', 'Healthcare'],
      description: 'Leading researcher in AI applications for healthcare with over 15 years of experience.',
      tags: ['AI', 'Healthcare', 'Research']
    },
    {
      id: '2',
      name: 'TechStart Inc.',
      organization: 'TechStart Inc.',
      type: 'startup',
      expertise: ['IoT', 'Smart Cities', 'Data Analytics'],
      description: 'Innovative startup focused on smart city solutions using IoT and data analytics.',
      tags: ['IoT', 'Smart Cities', 'Startup']
    }
  ]);

  // Filter collaborations based on active filter
  const filteredCollaborations = collaborations.filter(collaboration => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'challenges' && collaboration.type === 'challenge') return true;
    if (activeFilter === 'partnerships' && collaboration.type === 'partnership') return true;
    return false;
  });

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

  const handleBackToHome = () => {
    setShowHomePage(true);
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

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      
      <Route path="/" element={
        <>
          <Header 
            onNavigateToWorkspace={handleNavigateToWorkspace}
            onNavigateToChallenges={handleNavigateToChallenges}
            onNavigateToPartnerships={handleNavigateToPartnerships}
            onNavigateToInnovators={handleNavigateToInnovators}
            onBackToHome={handleBackToHome}
            onNavigateToProfile={isAuthenticated ? handleNavigateToProfile : undefined}
            onNavigateToAuth={!isAuthenticated ? handleNavigateToAuth : undefined}
          />
          
          {showHomePage ? (
            <HomePage 
              onNavigateToWorkspace={handleNavigateToWorkspace}
              onNavigateToCollaboration={handleNavigateToCollaboration}
              onNavigateToChallenges={handleNavigateToChallenges}
              onNavigateToPartnerships={handleNavigateToPartnerships}
              onNavigateToInnovators={handleNavigateToInnovators}
            />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {activePage === 'collaborations' && !selectedCollaboration && (
                <>
                  <WorkspaceHeader 
                    onCreateCollaboration={(collaboration) => {
                      // Handle collaboration creation
                      console.log('Creating collaboration:', collaboration);
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
                      name: user?.name || 'Current User',
                      type: user?.role as 'individual' || 'individual',
                      organization: user?.organization || 'SANAD Platform',
                      description: user?.bio || 'SANAD Platform user',
                      expertise: user?.skills || ['Technology', 'Innovation'],
                      tags: user?.interests || ['Sustainable Development', 'Digital Transformation']
                    }}
                  />
                </ProtectedRoute>
              )}
            </div>
          )}
        </>
      } />
    </Routes>
  );
}

export default App;