import React from 'react';
import {
  Clock,
  DollarSign,
  Briefcase,
  Target,
  Tag,
  Zap,
  Users,
  Award,
  MessageSquare,
  FileText,
  UserPlus,
} from 'lucide-react';

interface DetailsTabsProps {
  collaboration: any;
  openRequests: any[];
  onRequestInterest: (request: any) => void;
}

export function DetailsTabs({ collaboration, openRequests, onRequestInterest }: DetailsTabsProps) {
  return (
    <div className='px-8 py-6'>
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
        {/* Details Section */}
        <div className='lg:col-span-3 space-y-6'>
          {collaboration.type === 'challenge' && collaboration.challengeDetails && (
            <>
              <div className='flex items-start'>
                <Clock className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-900'>Deadline</p>
                  <p className='text-sm text-gray-500'>{collaboration.challengeDetails.deadline}</p>
                </div>
              </div>
              <div className='flex items-start'>
                <DollarSign className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-900'>Reward</p>
                  <p className='text-sm text-gray-500'>{collaboration.challengeDetails.reward}</p>
                </div>
              </div>
              <div className='flex items-start'>
                <Briefcase className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-900'>Eligibility</p>
                  <p className='text-sm text-gray-500'>
                    {collaboration.challengeDetails.eligibilityCriteria}
                  </p>
                </div>
              </div>
            </>
          )}

          {collaboration.type === 'partnership' && collaboration.partnershipDetails && (
            <>
              <div className='flex items-start'>
                <Clock className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-900'>Duration</p>
                  <p className='text-sm text-gray-500'>
                    {collaboration.partnershipDetails.duration}
                  </p>
                </div>
              </div>
              <div className='flex items-start'>
                <Briefcase className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-900'>Resources</p>
                  <p className='text-sm text-gray-500'>
                    {collaboration.partnershipDetails.resources}
                  </p>
                </div>
              </div>
              <div className='flex items-start'>
                <Target className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-900'>Expected Outcomes</p>
                  <p className='text-sm text-gray-500'>
                    {collaboration.partnershipDetails.expectedOutcomes}
                  </p>
                </div>
              </div>
            </>
          )}

          {collaboration.type === 'idea' && collaboration.ideaDetails && (
            <>
              <div className='flex items-start'>
                <Tag className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-900'>Category</p>
                  <p className='text-sm text-gray-500'>{collaboration.ideaDetails.category}</p>
                </div>
              </div>
              <div className='flex items-start'>
                <Zap className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-900'>Stage</p>
                  <p className='text-sm text-gray-500'>{collaboration.ideaDetails.stage}</p>
                </div>
              </div>
              <div className='flex items-start'>
                <Users className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-900'>Target Audience</p>
                  <p className='text-sm text-gray-500'>
                    {collaboration.ideaDetails.targetAudience}
                  </p>
                </div>
              </div>
              <div className='flex items-start'>
                <Award className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-900'>Potential Impact</p>
                  <p className='text-sm text-gray-500'>
                    {collaboration.ideaDetails.potentialImpact}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
            <h3 className='font-semibold text-gray-900 mb-4'>Quick Stats</h3>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-500'>Comments</span>
                <span className='font-medium'>{collaboration.comments?.length || 0}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-500'>Team Size</span>
                <span className='font-medium'>{collaboration.teamMembers?.length || 0}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-500'>Milestones</span>
                <span className='font-medium'>{collaboration.milestones?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Open Positions */}
          {openRequests.length > 0 && (
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
              <h3 className='font-semibold text-gray-900 mb-4'>Open Positions</h3>
              <div className='space-y-3'>
                {openRequests.map(request => (
                  <div key={request.id} className='border-l-4 border-indigo-500 pl-3'>
                    <p className='font-medium text-gray-900'>{request.role}</p>
                    {request.skills && (
                      <p className='text-xs text-gray-500 mt-1'>
                        {request.skills.slice(0, 3).join(', ')}
                      </p>
                    )}
                    <button
                      onClick={() => onRequestInterest(request)}
                      className='mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium'
                    >
                      Express Interest →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
