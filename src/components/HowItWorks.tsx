import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HowItWorksProps {
  onBack: () => void;
}

export function HowItWorks({ onBack }: HowItWorksProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={onBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </button>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h1>
            
            <div className="prose prose-indigo max-w-none">
              <h2>Connecting Innovators with Opportunities</h2>
              <p>
                Saned is a platform designed to bridge the gap between innovators, challenges, 
                and partnerships. Our mission is to facilitate collaboration and drive innovation 
                across sectors.
              </p>
              
              <h3>For Innovators</h3>
              <ol>
                <li>
                  <strong>Create Your Profile</strong> - Showcase your expertise, experience, and interests.
                </li>
                <li>
                  <strong>Discover Opportunities</strong> - Browse challenges and partnerships that match your skills.
                </li>
                <li>
                  <strong>Express Interest</strong> - Apply to collaborate on projects that interest you.
                </li>
                <li>
                  <strong>Collaborate</strong> - Work with partners to bring ideas to life.
                </li>
              </ol>
              
              <h3>For Organizations</h3>
              <ol>
                <li>
                  <strong>Post Challenges</strong> - Share problems that need innovative solutions.
                </li>
                <li>
                  <strong>Propose Partnerships</strong> - Offer collaboration opportunities.
                </li>
                <li>
                  <strong>Review Applications</strong> - Find the right innovators for your projects.
                </li>
                <li>
                  <strong>Collaborate</strong> - Work together to achieve shared goals.
                </li>
              </ol>
              
              <h3>Our Matching Process</h3>
              <p>
                We use a combination of AI-powered algorithms and human expertise to match 
                innovators with the right opportunities. Our platform considers skills, 
                experience, interests, and past collaborations to suggest the most promising 
                connections.
              </p>
              
              <h3>Support Throughout the Journey</h3>
              <p>
                From initial connection to project completion, Saned provides tools and 
                resources to support successful collaborations. Our team is available to 
                help with any questions or challenges along the way.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 