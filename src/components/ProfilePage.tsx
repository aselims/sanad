import React, { useState } from 'react';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Users, 
  Award,
  Bell,
  Calendar,
  FileText,
  Link as LinkIcon,
  Star,
  Target,
  ThumbsUp
} from 'lucide-react';
import { Innovator, Collaboration } from '../types';

interface ProfilePageProps {
  user: Innovator;
  potentialMatches?: Innovator[];
  matchRequests?: {
    innovator: Innovator;
    challenge: Collaboration;
    message: string;
    date: string;
  }[];
}

export function ProfilePage({ 
  user, 
  potentialMatches = [], 
  matchRequests = [] 
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'potential-matches' | 'match-requests'>('profile');

  // Function to render different content based on user type
  const renderTypeSpecificFields = () => {
    switch (user.type) {
      case 'investor':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Investment Focus</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Seed Stage
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Series A
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Sustainability
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Clean Tech
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Investment Portfolio</h3>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">EcoTech Solutions</h4>
                      <p className="text-xs text-gray-500">Renewable Energy • 2021</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Building className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">AgriTech Innovations</h4>
                      <p className="text-xs text-gray-500">AgTech • 2022</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Investment Criteria</h3>
              <div className="mt-2 space-y-3">
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Investment Range</h4>
                    <p className="text-sm text-gray-500">$500K - $2M</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Target className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Target ROI</h4>
                    <p className="text-sm text-gray-500">3-5x within 5 years</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Geographic Focus</h4>
                    <p className="text-sm text-gray-500">Middle East, North Africa, Europe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'startup':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
              <div className="mt-2 space-y-3">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Founded</h4>
                    <p className="text-sm text-gray-500">2020</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Team Size</h4>
                    <p className="text-sm text-gray-500">15-30 employees</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Funding Stage</h4>
                    <p className="text-sm text-gray-500">Series A</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Product & Technology</h3>
              <div className="mt-2 space-y-3">
                <p className="text-sm text-gray-600">
                  Our AI-driven platform helps organizations optimize their energy consumption through real-time monitoring and predictive analytics.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Machine Learning
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    IoT
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Cloud Computing
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Traction & Achievements</h3>
              <div className="mt-2 space-y-3">
                <div className="flex items-start">
                  <Award className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Awards</h4>
                    <p className="text-sm text-gray-500">Sustainability Innovation Award 2022</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ThumbsUp className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Key Metrics</h4>
                    <p className="text-sm text-gray-500">30% MoM growth, 25+ enterprise clients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'research':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Research Focus</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Medical Imaging
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  AI in Healthcare
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Diagnostics
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Publications</h3>
              <div className="mt-2 space-y-3">
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Recent Publications</h4>
                    <p className="text-sm text-gray-500">15+ peer-reviewed articles in leading journals</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <LinkIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Research Repository</h4>
                    <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">View Publications</a>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Facilities & Resources</h3>
              <div className="mt-2 space-y-3">
                <p className="text-sm text-gray-600">
                  State-of-the-art laboratories equipped with advanced imaging technology and computing resources for AI model training.
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Professional Background</h3>
              <div className="mt-2 space-y-3">
                <p className="text-sm text-gray-600">
                  {user.description}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Areas of Expertise</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.expertise.map((skill, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  // Function to render the profile tab content
  const renderProfileContent = () => {
    return (
      <div className="space-y-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal and organizational details.</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name / Organization</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{user.type}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">contact@{user.organization.toLowerCase().replace(/\s+/g, '')}.com</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Riyadh, Saudi Arabia</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">About</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.description}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Type-specific information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {user.type === 'investor' ? 'Investment Information' : 
               user.type === 'startup' ? 'Company Information' :
               user.type === 'research' ? 'Research Information' : 'Professional Information'}
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            {renderTypeSpecificFields()}
          </div>
        </div>
      </div>
    );
  };

  // Function to render potential matches tab content
  const renderPotentialMatchesContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">AI-Suggested Matches</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Innovators that match your interests and requirements based on AI analysis.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {potentialMatches.length > 0 ? (
                potentialMatches.map((match) => (
                  <li key={match.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          {match.type === 'startup' ? (
                            <Briefcase className="h-6 w-6 text-indigo-600" />
                          ) : match.type === 'research' ? (
                            <Award className="h-6 w-6 text-purple-600" />
                          ) : (
                            <User className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{match.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{match.type}</div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-400" />
                          <span className="ml-1 text-sm text-gray-600">92% Match</span>
                        </div>
                        <div className="mt-2">
                          <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 line-clamp-2">{match.description}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {match.expertise.slice(0, 3).map((skill, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {match.expertise.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          +{match.expertise.length - 3} more
                        </span>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-12 sm:px-6 text-center">
                  <div className="text-gray-500">
                    <p>No potential matches found at the moment.</p>
                    <p className="mt-1 text-sm">Check back later as our AI continues to analyze new innovators.</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Function to render match requests tab content
  const renderMatchRequestsContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Match Requests</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Innovators who have expressed interest in collaborating with you.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {matchRequests.length > 0 ? (
                matchRequests.map((request, index) => (
                  <li key={index} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          {request.innovator.type === 'startup' ? (
                            <Briefcase className="h-6 w-6 text-indigo-600" />
                          ) : request.innovator.type === 'research' ? (
                            <Award className="h-6 w-6 text-purple-600" />
                          ) : (
                            <User className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{request.innovator.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{request.innovator.type}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{request.date}</div>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium text-gray-900">Interested in: {request.challenge.title}</div>
                      <p className="mt-1 text-sm text-gray-600">{request.message}</p>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Accept Request
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Decline
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Message
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-12 sm:px-6 text-center">
                  <div className="text-gray-500">
                    <p>No match requests at the moment.</p>
                    <p className="mt-1 text-sm">When innovators express interest in your challenges, they will appear here.</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
              {user.type === 'investor' ? (
                <DollarSign className="h-10 w-10 text-white" />
              ) : user.type === 'startup' ? (
                <Briefcase className="h-10 w-10 text-white" />
              ) : user.type === 'research' ? (
                <Award className="h-10 w-10 text-white" />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{user.type}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Connect
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Message
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'text-indigo-600 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('potential-matches')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'potential-matches'
                  ? 'text-indigo-600 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
              }`}
            >
              Potential Matches
              {potentialMatches.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {potentialMatches.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('match-requests')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'match-requests'
                  ? 'text-indigo-600 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
              }`}
            >
              Match Requests
              {matchRequests.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {matchRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'profile' && renderProfileContent()}
      {activeTab === 'potential-matches' && renderPotentialMatchesContent()}
      {activeTab === 'match-requests' && renderMatchRequestsContent()}
    </div>
  );
} 