import React, { useState } from 'react';
import { X, ChevronDown, Calendar, Users, Target, Award, Clock, DollarSign } from 'lucide-react';
import { Collaboration } from '../types';

interface NewCollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCollaboration: (collaboration: Partial<Collaboration>) => void;
}

export function NewCollaborationModal({ 
  isOpen, 
  onClose, 
  onCreateCollaboration 
}: NewCollaborationModalProps) {
  const [collaborationType, setCollaborationType] = useState<'challenge' | 'partnership' | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    participants: '',
    // Challenge specific fields
    deadline: '',
    reward: '',
    eligibilityCriteria: '',
    // Partnership specific fields
    duration: '',
    resources: '',
    expectedOutcomes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the collaboration object based on type
    const newCollaboration: Partial<Collaboration> = {
      title: formData.title,
      description: formData.description,
      participants: formData.participants.split(',').map(p => p.trim()),
      status: 'proposed',
      type: collaborationType || 'partnership',
      collaborationRequests: []
    };

    // Add type-specific fields
    if (collaborationType === 'challenge') {
      newCollaboration.challengeDetails = {
        deadline: formData.deadline,
        reward: formData.reward,
        eligibilityCriteria: formData.eligibilityCriteria
      };
    } else {
      newCollaboration.partnershipDetails = {
        duration: formData.duration,
        resources: formData.resources,
        expectedOutcomes: formData.expectedOutcomes
      };
    }

    onCreateCollaboration(newCollaboration);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
          <h3 className="text-xl font-semibold text-gray-900">
            {collaborationType ? 
              `Create New ${collaborationType === 'challenge' ? 'Challenge' : 'Partnership'}` : 
              'Create New Collaboration'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        {!collaborationType ? (
          <div className="p-4 md:p-5">
            <p className="mb-6 text-gray-600">
              Choose the type of collaboration you want to create:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                onClick={() => setCollaborationType('challenge')}
                className="border border-gray-200 rounded-lg p-6 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Challenge</h4>
                <p className="text-gray-600 text-sm">
                  Create a specific problem statement with defined goals, timeline, and rewards. 
                  Ideal for seeking innovative solutions to well-defined problems.
                </p>
              </div>
              
              <div 
                onClick={() => setCollaborationType('partnership')}
                className="border border-gray-200 rounded-lg p-6 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Partnership</h4>
                <p className="text-gray-600 text-sm">
                  Establish a collaborative relationship with shared resources and goals. 
                  Suitable for long-term cooperation and joint ventures.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 md:p-5">
            <div className="grid gap-4 mb-4 grid-cols-1 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900">Title</label>
                <input 
                  type="text" 
                  name="title" 
                  id="title" 
                  value={formData.title}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5" 
                  placeholder="Enter a descriptive title" 
                  required 
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">Description</label>
                <textarea 
                  name="description" 
                  id="description" 
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5" 
                  placeholder="Provide a detailed description" 
                  required 
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="participants" className="block mb-2 text-sm font-medium text-gray-900">Participants</label>
                <input 
                  type="text" 
                  name="participants" 
                  id="participants" 
                  value={formData.participants}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5" 
                  placeholder="Enter participant names, separated by commas" 
                  required 
                />
              </div>
              
              {/* Challenge-specific fields */}
              {collaborationType === 'challenge' && (
                <>
                  <div>
                    <label htmlFor="deadline" className="block mb-2 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Deadline</span>
                      </div>
                    </label>
                    <input 
                      type="date" 
                      name="deadline" 
                      id="deadline" 
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="reward" className="block mb-2 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-1" />
                        <span>Reward</span>
                      </div>
                    </label>
                    <input 
                      type="text" 
                      name="reward" 
                      id="reward" 
                      value={formData.reward}
                      onChange={handleInputChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5" 
                      placeholder="e.g. $10,000, Mentorship, etc." 
                      required 
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="eligibilityCriteria" className="block mb-2 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        <span>Eligibility Criteria</span>
                      </div>
                    </label>
                    <textarea 
                      name="eligibilityCriteria" 
                      id="eligibilityCriteria" 
                      rows={3}
                      value={formData.eligibilityCriteria}
                      onChange={handleInputChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5" 
                      placeholder="Describe who can participate in this challenge" 
                      required 
                    />
                  </div>
                </>
              )}
              
              {/* Partnership-specific fields */}
              {collaborationType === 'partnership' && (
                <>
                  <div>
                    <label htmlFor="duration" className="block mb-2 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Duration</span>
                      </div>
                    </label>
                    <input 
                      type="text" 
                      name="duration" 
                      id="duration" 
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5" 
                      placeholder="e.g. 6 months, 1 year, etc." 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="resources" className="block mb-2 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>Resources</span>
                      </div>
                    </label>
                    <input 
                      type="text" 
                      name="resources" 
                      id="resources" 
                      value={formData.resources}
                      onChange={handleInputChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5" 
                      placeholder="e.g. Funding, Equipment, Expertise" 
                      required 
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="expectedOutcomes" className="block mb-2 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        <span>Expected Outcomes</span>
                      </div>
                    </label>
                    <textarea 
                      name="expectedOutcomes" 
                      id="expectedOutcomes" 
                      rows={3}
                      value={formData.expectedOutcomes}
                      onChange={handleInputChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5" 
                      placeholder="Describe the expected results of this partnership" 
                      required 
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setCollaborationType(null)}
                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
              >
                Back
              </button>
              <button
                type="submit"
                className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Create
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 