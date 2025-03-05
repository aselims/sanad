import React, { useState } from 'react';
import { Header } from './components/Header';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { CollaborationList } from './components/CollaborationList';
import { CollaborationDetails } from './components/CollaborationDetails';
import { HomePage } from './components/HomePage';
import type { Collaboration } from './types';

function App() {
  const [selectedCollaboration, setSelectedCollaboration] = useState<string | null>(null);
  const [showHomePage, setShowHomePage] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'challenge' | 'partnership'>('all');

  const sampleCollaborations: Collaboration[] = [
    {
      id: '1',
      title: 'Smart City Transportation Initiative',
      description: 'Collaboration between the Ministry of Transport and local startups to implement AI-driven traffic management solutions. Working on implementing smart traffic management solutions using AI and IoT sensors.',
      participants: ['Ministry of Transport', 'TechStart Inc.', 'Urban Planning Institute', 'AI Solutions Ltd'],
      status: 'active',
      challengeId: '1',
      type: 'challenge',
      collaborationRequests: [
        {
          id: '1-1',
          role: 'ML Engineer',
          expertise: ['TensorFlow', 'Computer Vision'],
          description: 'Looking for an ML engineer to help develop traffic pattern recognition models.',
          status: 'open'
        },
        {
          id: '1-2',
          role: 'IoT Specialist',
          expertise: ['Embedded Systems', 'Sensor Networks'],
          description: 'Need expertise in implementing city-wide sensor networks.',
          status: 'open'
        }
      ]
    },
    {
      id: '2',
      title: 'Healthcare AI Research Partnership',
      description: 'Joint research project to develop and validate AI algorithms for early disease detection. Developing machine learning models for medical image analysis and early disease detection.',
      participants: ['HealthTech Research', 'Medical University', 'DataAI Corp'],
      status: 'proposed',
      challengeId: '2',
      type: 'partnership',
      collaborationRequests: [
        {
          id: '2-1',
          role: 'Medical Researcher',
          expertise: ['Clinical Trials', 'Medical Imaging'],
          description: 'Seeking medical researchers with experience in clinical validation.',
          status: 'open'
        }
      ]
    },
    {
      id: '3',
      title: 'Renewable Energy Innovation',
      description: 'Multi-stakeholder collaboration to develop new solar energy storage solutions. Research and development of advanced energy storage technologies for renewable energy systems.',
      participants: ['EnergyTech Solutions', 'National Research Lab', 'GreenFund Ventures'],
      status: 'active',
      type: 'challenge',
      collaborationRequests: [
        {
          id: '3-1',
          role: 'Battery Technology Expert',
          expertise: ['Energy Storage', 'Material Science'],
          description: 'Looking for experts in advanced battery technology and materials.',
          status: 'open'
        }
      ]
    }
  ];

  const filteredCollaborations = activeFilter === 'all' 
    ? sampleCollaborations 
    : sampleCollaborations.filter(c => c.type === activeFilter);

  const selectedProject = selectedCollaboration 
    ? sampleCollaborations.find(c => c.id === selectedCollaboration) 
    : null;

  // For demo purposes, clicking on a collaboration will navigate to the collaboration details
  const handleViewCollaboration = (id: string) => {
    setSelectedCollaboration(id);
    setShowHomePage(false);
  };

  // For demo purposes, clicking back will return to the home page
  const handleBackToHome = () => {
    setSelectedCollaboration(null);
    setShowHomePage(true);
  };

  // Navigate to the workspace (list of collaborations)
  const handleNavigateToWorkspace = () => {
    setSelectedCollaboration(null);
    setShowHomePage(false);
    setActiveFilter('all');
  };

  // Navigate to challenges
  const handleNavigateToChallenges = () => {
    setSelectedCollaboration(null);
    setShowHomePage(false);
    setActiveFilter('challenge');
  };

  // Navigate to partnerships
  const handleNavigateToPartnerships = () => {
    setSelectedCollaboration(null);
    setShowHomePage(false);
    setActiveFilter('partnership');
  };

  if (showHomePage) {
    return (
      <HomePage 
        onNavigateToWorkspace={handleNavigateToWorkspace} 
        onNavigateToCollaboration={handleViewCollaboration}
        onNavigateToChallenges={handleNavigateToChallenges}
        onNavigateToPartnerships={handleNavigateToPartnerships}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onBackToHome={handleBackToHome}
        onNavigateToChallenges={handleNavigateToChallenges}
        onNavigateToPartnerships={handleNavigateToPartnerships}
      />
      <WorkspaceHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedProject ? (
          <CollaborationDetails
            collaboration={selectedProject}
            onBack={() => setSelectedCollaboration(null)}
          />
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {activeFilter === 'all' ? 'All Initiatives' : 
                 activeFilter === 'challenge' ? 'Challenges' : 'Partnerships'}
              </h2>
              <CollaborationList
                collaborations={filteredCollaborations.filter(c => c.status === 'active')}
                onViewDetails={handleViewCollaboration}
              />
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Proposed Initiatives</h2>
              <CollaborationList
                collaborations={filteredCollaborations.filter(c => c.status === 'proposed')}
                onViewDetails={handleViewCollaboration}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;