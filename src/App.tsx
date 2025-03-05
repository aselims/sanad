import React, { useState } from 'react';
import { Header } from './components/Header';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { CollaborationList } from './components/CollaborationList';
import { CollaborationDetails } from './components/CollaborationDetails';
import { HomePage } from './components/HomePage';
import { InnovatorsList } from './components/InnovatorsList';
import type { Collaboration, Innovator } from './types';

function App() {
  const [selectedCollaboration, setSelectedCollaboration] = useState<string | null>(null);
  const [showHomePage, setShowHomePage] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'challenge' | 'partnership'>('all');
  const [activePage, setActivePage] = useState<'collaborations' | 'innovators'>('collaborations');

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

  const sampleInnovators: Innovator[] = [
    {
      id: '1',
      name: 'TechStart Inc.',
      organization: 'TechStart Inc.',
      type: 'startup',
      expertise: ['AI', 'Computer Vision', 'NLP'],
      description: 'Specializing in computer vision and natural language processing solutions for various industries.',
      profileImage: 'blue-gradient',
      tags: ['AI', 'Computer Vision', 'NLP']
    },
    {
      id: '2',
      name: 'Medical University',
      organization: 'Medical University',
      type: 'research',
      expertise: ['Healthcare', 'Medical Imaging', 'Research'],
      description: 'Leading research in medical imaging, diagnostics, and healthcare innovation.',
      profileImage: 'purple-gradient',
      tags: ['Healthcare', 'Medical Imaging', 'Research']
    },
    {
      id: '3',
      name: 'GreenFund Ventures',
      organization: 'GreenFund Ventures',
      type: 'investor',
      expertise: ['Renewable Energy', 'Sustainability', 'Investment'],
      description: 'Investing in renewable energy, sustainable agriculture, and clean technology solutions.',
      profileImage: 'green-gradient',
      tags: ['Renewable Energy', 'Sustainability', 'Investment']
    },
    {
      id: '4',
      name: 'Smart City Solutions',
      organization: 'Smart City Solutions',
      type: 'corporate',
      expertise: ['IoT', 'Urban Planning', 'Smart Infrastructure'],
      description: 'Developing integrated solutions for modern urban environments and smart city infrastructure.',
      profileImage: 'orange-gradient',
      tags: ['IoT', 'Urban Planning', 'Smart Infrastructure']
    },
    {
      id: '5',
      name: 'Dr. Sarah Johnson',
      organization: 'National Research Institute',
      type: 'individual',
      expertise: ['Biotechnology', 'Genetics', 'Healthcare'],
      description: 'Leading researcher in biotechnology with focus on genetic engineering applications in healthcare.',
      profileImage: 'teal-gradient',
      tags: ['Biotechnology', 'Genetics', 'Healthcare']
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
    setActivePage('collaborations');
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
    setActivePage('collaborations');
  };

  // Navigate to challenges
  const handleNavigateToChallenges = () => {
    console.log("handleNavigateToChallenges called in App.tsx");
    setSelectedCollaboration(null);
    setShowHomePage(false);
    setActiveFilter('challenge');
    setActivePage('collaborations');
  };

  // Navigate to partnerships
  const handleNavigateToPartnerships = () => {
    console.log("handleNavigateToPartnerships called in App.tsx");
    setSelectedCollaboration(null);
    setShowHomePage(false);
    setActiveFilter('partnership');
    setActivePage('collaborations');
  };

  // Navigate to innovators
  const handleNavigateToInnovators = () => {
    console.log("handleNavigateToInnovators called in App.tsx");
    setSelectedCollaboration(null);
    setShowHomePage(false);
    setActivePage('innovators');
  };

  if (showHomePage) {
    console.log("Rendering HomePage with navigation functions");
    return (
      <HomePage 
        onNavigateToWorkspace={handleNavigateToWorkspace} 
        onNavigateToCollaboration={handleViewCollaboration}
        onNavigateToChallenges={handleNavigateToChallenges}
        onNavigateToPartnerships={handleNavigateToPartnerships}
        onNavigateToInnovators={handleNavigateToInnovators}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onBackToHome={handleBackToHome}
        onNavigateToChallenges={handleNavigateToChallenges}
        onNavigateToPartnerships={handleNavigateToPartnerships}
        onNavigateToInnovators={handleNavigateToInnovators}
      />
      <WorkspaceHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activePage === 'collaborations' && selectedProject ? (
          <CollaborationDetails
            collaboration={selectedProject}
            onBack={() => setSelectedCollaboration(null)}
          />
        ) : activePage === 'collaborations' ? (
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
        ) : activePage === 'innovators' ? (
          <InnovatorsList innovators={sampleInnovators} />
        ) : null}
      </main>
    </div>
  );
}

export default App;