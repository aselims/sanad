import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  Lightbulb, 
  Rocket, 
  Building, 
  GraduationCap, 
  DollarSign,
  ArrowRight,
  Globe,
  Target,
  Zap,
  Bot,
} from 'lucide-react';
import { Innovator, Collaboration } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface HomePageProps {
  onNavigateToWorkspace: () => void;
  onNavigateToCollaboration: (id: string) => void;
  onNavigateToChallenges?: () => void;
  onNavigateToPartnerships?: () => void;
  onNavigateToIdeas?: () => void;
  onNavigateToInnovators?: () => void;
  onNavigateToProfileById?: (id: string) => void;
  onNavigateToBlog?: () => void;
  onNavigateToHowItWorks?: () => void;
  onNavigateToSuccessStories?: () => void;
  onNavigateToFAQ?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToContactUs?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToCookies?: () => void;
}

export function HomePage({ 
  onNavigateToWorkspace, 
  onNavigateToCollaboration,
  onNavigateToChallenges = onNavigateToWorkspace,
  onNavigateToPartnerships = onNavigateToWorkspace,
  onNavigateToIdeas = onNavigateToWorkspace,
  onNavigateToInnovators = onNavigateToWorkspace,
  onNavigateToProfileById,
  onNavigateToBlog = onNavigateToWorkspace,
  onNavigateToHowItWorks = onNavigateToWorkspace,
  onNavigateToSuccessStories = onNavigateToWorkspace,
  onNavigateToFAQ = onNavigateToWorkspace,
  onNavigateToSupport = onNavigateToWorkspace,
  onNavigateToContactUs = onNavigateToWorkspace,
  onNavigateToTerms = onNavigateToWorkspace,
  onNavigateToPrivacy = onNavigateToWorkspace,
  onNavigateToCookies = onNavigateToWorkspace,
}: HomePageProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-blue-500 py-20">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Turn Ideas into Impact:<br />
              Connect, Collaborate, and Co-Create
            </h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
              Empowering innovators to find the right partners and bring ideas to life through collaboration.
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={onNavigateToWorkspace}
                className="bg-white text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md shadow-lg px-6 py-3 text-base font-medium"
              >
                Explore Collaborations
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => window.location.href = '/auth'}
                  className="bg-indigo-700 text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md shadow-lg px-6 py-3 text-base font-medium"
                >
                  Join Now
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Collopi Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A simple process to connect innovators, organizations, and resources to create impactful solutions together.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Lightbulb className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">1. Post or Find Opportunities</h3>
              <p className="text-gray-600 text-center">
                Share your innovation challenges or browse existing opportunities to find the perfect match for your expertise.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">2. Connect with Partners</h3>
              <p className="text-gray-600 text-center">
                Reach out to potential collaborators, discuss ideas, and form partnerships with the right stakeholders.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Rocket className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">3. Collaborate & Innovate</h3>
              <p className="text-gray-600 text-center">
                Work together in a structured environment with tools designed to help your collaboration succeed.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <DollarSign className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">4. Success-driven model</h3>
              <p className="text-gray-600 text-center">
                Partners contribute just 1% of revenue generated from successful collaborations. You only pay when you succeed.
              </p>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <button
              onClick={onNavigateToHowItWorks}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 font-medium inline-flex items-center"
            >
              Learn More About How It Works
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </section>
      
      {/* Collaboration Types */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Who Can Collaborate on Collopi</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform brings together diverse stakeholders to create powerful innovation ecosystems.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Startups</h3>
              <p className="text-gray-600 mb-4">
                Connect with resources, mentors, and organizations to scale your innovative solutions.
              </p>
              <button 
                onClick={onNavigateToInnovators}
                className="text-indigo-600 font-medium flex items-center hover:text-indigo-800"
              >
                Learn more <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Researchers</h3>
              <p className="text-gray-600 mb-4">
                Find industry partners to apply your research and create real-world impact.
              </p>
              <button 
                onClick={onNavigateToInnovators}
                className="text-indigo-600 font-medium flex items-center hover:text-indigo-800"
              >
                Learn more <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Investors</h3>
              <p className="text-gray-600 mb-4">
                Discover promising ventures and research projects with high growth potential.
              </p>
              <button 
                onClick={onNavigateToInnovators}
                className="text-indigo-600 font-medium flex items-center hover:text-indigo-800"
              >
                Learn more <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Organizations</h3>
              <p className="text-gray-600 mb-4">
                Partner with innovators to solve challenges and drive digital transformation.
              </p>
              <button 
                onClick={onNavigateToChallenges}
                className="text-indigo-600 font-medium flex items-center hover:text-indigo-800"
              >
                Learn more <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Collaborations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Collaborations</h2>
            <button 
              onClick={onNavigateToWorkspace}
              className="text-indigo-600 font-medium flex items-center hover:text-indigo-800"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Globe className="h-16 w-16 text-white opacity-75" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">Smart City Transportation Initiative</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Collaboration between the Ministry of Transport and local startups to implement AI-driven traffic management solutions.
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span>4 Participants</span>
                  <span className="mx-2">•</span>
                  <span>2 Open Positions</span>
                </div>
                <button 
                  onClick={() => onNavigateToCollaboration('1')}
                  className="block w-full text-center py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  View Details
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <Zap className="h-16 w-16 text-white opacity-75" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">Healthcare AI Research Partnership</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Proposed</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Joint research project to develop and validate AI algorithms for early disease detection.
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span>3 Participants</span>
                  <span className="mx-2">•</span>
                  <span>1 Open Position</span>
                </div>
                <button 
                  onClick={() => onNavigateToCollaboration('2')}
                  className="block w-full text-center py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  View Details
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                <Lightbulb className="h-16 w-16 text-white opacity-75" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">Sustainable Agriculture Innovation</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Developing water-efficient farming technologies through collaboration between researchers and agricultural companies.
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span>5 Participants</span>
                  <span className="mx-2">•</span>
                  <span>0 Open Positions</span>
                </div>
                <button 
                  onClick={() => onNavigateToCollaboration('3')}
                  className="block w-full text-center py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Collopi Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 shadow-xl">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-6">Why Collopi?</h2>
              
              <div className="mb-8">
                <p className="text-2xl font-semibold text-white mb-4">
                  95% of startups fail; Not because they lack good ideas, but because they lack the right connections.
                </p>
                <p className="text-xl text-indigo-100 mb-6">
                  Collopi helps startups, researchers, and businesses join forces, share resources, and discover synergies before wasting time and effort reinventing the wheel.
                </p>
                <p className="text-2xl font-bold text-white mt-8">
                  🚀 Why compete alone when you can build together?
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                {!isAuthenticated && (
                  <button 
                    onClick={onNavigateToWorkspace}
                    className="px-8 py-4 bg-white text-indigo-700 rounded-lg shadow-md hover:bg-gray-50 font-medium text-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Create an Account
                  </button>
                )}
                <button 
                  onClick={onNavigateToChallenges}
                  className="px-8 py-4 bg-indigo-800 text-white rounded-lg shadow-md hover:bg-indigo-900 font-medium text-lg transition-all duration-200 transform hover:scale-105"
                >
                  Browse Challenges
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 