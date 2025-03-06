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

function App() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedCollaboration, setSelectedCollaboration] = useState<string | null>(null);
  const [showHomePage, setShowHomePage] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'challenge' | 'partnership'>('all');
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

  // Navigation functions
  const handleNavigateToWorkspace = () => {
    setShowHomePage(false);
    setActivePage('collaborations');
    setSelectedCollaboration(null);
    setSelectedInnovator(null);
  };

  const handleNavigateToCollaboration = (id: string) => {
    setSelectedCollaboration(id);
    setShowHomePage(false);
    setActivePage('collaborations');
  };

  const handleNavigateToCollaborations = (filter: 'all' | 'challenge' | 'partnership' = 'all') => {
    setShowHomePage(false);
    setActivePage('collaborations');
    setActiveFilter(filter);
    setSelectedCollaboration(null);
    setSelectedInnovator(null);
  };

  const handleNavigateToChallenges = () => {
    handleNavigateToCollaborations('challenge');
  };

  const handleNavigateToPartnerships = () => {
    handleNavigateToCollaborations('partnership');
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

  // Filter collaborations based on active filter
  const filteredCollaborations = collaborations.filter(collab => {
    if (activeFilter === 'all') return true;
    return collab.type === activeFilter;
  });

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
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                  />
                  <CollaborationList 
                    collaborations={filteredCollaborations} 
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
                  onBack={() => setSelectedInnovator(null)}
                />
              )}
              
              {activePage === 'profile' && (
                <ProtectedRoute>
                  <ProfilePage 
                    onBack={handleNavigateToWorkspace}
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