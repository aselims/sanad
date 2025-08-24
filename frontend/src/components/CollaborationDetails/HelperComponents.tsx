import React, { useState } from 'react';
import { CollaborationRequest } from './types';

interface ComingSoonOverlayProps {
  children: React.ReactNode;
  title?: string;
}

export function ComingSoonOverlay({ children, title = 'Coming Soon' }: ComingSoonOverlayProps) {
  const [isTransparent, setIsTransparent] = useState(false);

  const toggleTransparency = () => {
    setIsTransparent(!isTransparent);
  };

  return (
    <div className='relative'>
      {children}
      <div
        onClick={toggleTransparency}
        className={`absolute inset-0 ${isTransparent ? 'bg-gray-100 bg-opacity-30' : 'bg-gray-100 bg-opacity-99'} 
        flex items-center justify-center cursor-pointer transition-all duration-300`}
      >
        <div className='text-center'>
          <p className='text-2xl font-bold text-gray-800'>{title}</p>
          <p className='text-sm text-gray-600 mt-2'>Click to toggle transparency</p>
        </div>
      </div>
    </div>
  );
}

interface CollaborationRequestCardProps {
  request: CollaborationRequest;
  onExpressInterest: (request: CollaborationRequest) => void;
}

export function CollaborationRequestCard({
  request,
  onExpressInterest,
}: CollaborationRequestCardProps) {
  return (
    <div className='bg-white rounded-lg shadow p-4 border border-gray-200'>
      <div className='flex items-center justify-between mb-2'>
        <h4 className='font-semibold text-gray-900'>{request.role}</h4>
        <span
          className={`px-2 py-0.5 text-xs rounded-full ${
            request.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {request.status}
        </span>
      </div>
      <p className='text-sm text-gray-600 mb-3'>{request.description}</p>
      {request.skills && (
        <div className='flex flex-wrap gap-1 mb-3'>
          {request.skills.map((skill, index) => (
            <span key={index} className='px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded'>
              {skill}
            </span>
          ))}
        </div>
      )}
      {request.experience && (
        <p className='text-xs text-gray-500 mb-3'>Experience: {request.experience}</p>
      )}
      <button
        onClick={() => onExpressInterest(request)}
        className='w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium'
      >
        Express Interest
      </button>
    </div>
  );
}
