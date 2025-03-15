import React, { useState } from 'react';
import { X, ChevronDown, Calendar, Users, Target, Award, Clock, DollarSign, Lightbulb, Tag, Users as UsersIcon, Zap, Briefcase } from 'lucide-react';
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
  const [collaborationType, setCollaborationType] = useState<'challenge' | 'partnership' | 'idea' | null>(null);
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
    expectedOutcomes: '',
    // Idea specific fields
    category: '',
    stage: '',
    targetAudience: '',
    potentialImpact: '',
    resourcesNeeded: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    } else if (collaborationType === 'idea') {
      newCollaboration.ideaDetails = {
        category: formData.category,
        stage: formData.stage as 'concept' | 'prototype' | 'validated' | 'scaling',
        targetAudience: formData.targetAudience,
        potentialImpact: formData.potentialImpact,
        resourcesNeeded: formData.resourcesNeeded
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
              `Create New ${collaborationType === 'challenge' ? 'Challenge' : 
                           collaborationType === 'idea' ? 'Idea' : 'Partnership'}` : 
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <div 
                onClick={() => setCollaborationType('idea')}
                className="border border-gray-200 rounded-lg p-6 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 text-amber-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Idea</h4>
                <p className="text-gray-600 text-sm">
                  Share an innovative concept or early-stage idea that needs feedback, 
                  refinement, or collaborators to bring it to life.
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
                <label htmlFor="participants" className="block mb-2 text-sm font-medium text-gray-900">Additional Participants</label>
                <input 
                  type="text" 
                  name="participants" 
                  id="participants" 
                  value={formData.participants}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5" 
                  placeholder="Enter additional participant names, separated by commas (you will be added automatically)" 
                  required={false}
                />
                <p className="mt-1 text-xs text-gray-500">You will be automatically added as the proposer</p>
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
                      placeholder="e.g. Funding, Equipment, Expertise, etc." 
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
                      placeholder="Describe the expected outcomes of this partnership" 
                      required 
                    />
                  </div>
                </>
              )}

              {/* Idea-specific fields */}
              {collaborationType === 'idea' && (
                <>
                  <div>
                    <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        <span>Category</span>
                      </div>
                    </label>
                    <select
                      name="category"
                      id="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Environment">Environment</option>
                      <option value="Finance">Finance</option>
                      <option value="Social Impact">Social Impact</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Energy">Energy</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="stage" className="block mb-2 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span>Development Stage</span>
                      </div>
                    </label>
                    <select
                      name="stage"
                      id="stage"
                      value={formData.stage}
                      onChange={handleInputChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5"
                      required
                    >
                      <option value="">Select a stage</option>
                      <option value="concept">Concept (Just an idea)</option>
                      <option value="prototype">Prototype (Early development)</option>
                      <option value="validated">Validated (Tested with users)</option>
                      <option value="scaling">Scaling (Ready to grow)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="targetAudience" className="block mb-2 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-1" />
                        <span>Target Audience</span>
                      </div>
                    </label>
                    <input 
                      type="text" 
                      name="targetAudience" 
                      id="targetAudience" 
                      value={formData.targetAudience}
                      onChange={handleInputChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5" 
                      placeholder="Who will benefit from this idea?" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="potentialImpact" className="block mb-2 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 mr-1" />
                        <span>Potential Impact</span>
                      </div>
                    </label>
                    <input 
                      type="text" 
                      name="potentialImpact" 
                      id="potentialImpact" 
                      value={formData.potentialImpact}
                      onChange={handleInputChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5" 
                      placeholder="What impact could this idea have?" 
                      required 
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="resourcesNeeded" className="block mb-2 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>Resources Needed</span>
                      </div>
                    </label>
                    <textarea 
                      name="resourcesNeeded" 
                      id="resourcesNeeded" 
                      rows={3}
                      value={formData.resourcesNeeded}
                      onChange={handleInputChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5" 
                      placeholder="What resources do you need to develop this idea? (funding, expertise, connections, etc.)" 
                      required 
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
              >
                Cancel
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