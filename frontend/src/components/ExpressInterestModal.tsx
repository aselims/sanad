import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { CollaborationRequest, InterestSubmission } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { isInnovatorType } from '../constants/roles';

type CollaboratorType = 'startup' | 'research' | 'corporate' | 'government' | 'investor' | 'individual' | 'accelerator' | 'incubator';
type ModalType = 'position' | 'initiative';

interface ExpressInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: InterestSubmission) => void;
  request?: CollaborationRequest;
  modalType: ModalType;
  collaboratorType?: CollaboratorType;
  onCollaboratorTypeChange?: (type: CollaboratorType) => void;
}

export function ExpressInterestModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  request, 
  modalType,
  collaboratorType = 'individual',
  onCollaboratorTypeChange
}: ExpressInterestModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<InterestSubmission>({
    name: '',
    email: '',
    organization: '',
    message: '',
    expertise: [],
    collaboratorType: collaboratorType
  });

  // Set the collaborator type based on the logged-in user's role when the component mounts
  useEffect(() => {
    if (isAuthenticated && user && isInnovatorType(user.role) && onCollaboratorTypeChange) {
      onCollaboratorTypeChange(user.role as CollaboratorType);
      setFormData(prev => ({ ...prev, collaboratorType: user.role as CollaboratorType }));
    }
  }, [isAuthenticated, user, onCollaboratorTypeChange, collaboratorType]);

  // Update form data when collaborator type changes
  useEffect(() => {
    console.log('Collaborator type changed:', collaboratorType);
    setFormData(prev => ({ ...prev, collaboratorType }));
  }, [collaboratorType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    onSubmit(formData);
    onClose();
  };

  const getCollaboratorTypeLabel = () => {
    switch (collaboratorType) {
      case 'startup':
        return 'Startup';
      case 'research':
        return 'Research Institution';
      case 'corporate':
        return 'Corporate';
      case 'government':
        return 'Government';
      case 'investor':
        return 'Investor';
      case 'accelerator':
        return 'Accelerator';
      case 'incubator':
        return 'Incubator';
      case 'individual':
      default:
        return 'Individual';
    }
  };

  const getAdditionalFields = () => {
    switch (collaboratorType) {
      case 'startup':
        return (
          <div>
            <label htmlFor="foundingYear" className="block text-sm font-medium text-gray-700">
              Founding Year
            </label>
            <input
              type="number"
              id="foundingYear"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.foundingYear || ''}
              onChange={(e) => setFormData({ ...formData, foundingYear: e.target.value })}
            />
          </div>
        );
      case 'research':
        return (
          <div>
            <label htmlFor="researchArea" className="block text-sm font-medium text-gray-700">
              Primary Research Area
            </label>
            <input
              type="text"
              id="researchArea"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.researchArea || ''}
              onChange={(e) => setFormData({ ...formData, researchArea: e.target.value })}
            />
          </div>
        );
      case 'investor':
        return (
          <div>
            <label htmlFor="investmentFocus" className="block text-sm font-medium text-gray-700">
              Investment Focus
            </label>
            <input
              type="text"
              id="investmentFocus"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.investmentFocus || ''}
              onChange={(e) => setFormData({ ...formData, investmentFocus: e.target.value })}
            />
          </div>
        );
      case 'accelerator':
        return (
          <div>
            <label htmlFor="foundingYear" className="block text-sm font-medium text-gray-700">
              Founding Year
            </label>
            <input
              type="number"
              id="foundingYear"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.foundingYear || ''}
              onChange={(e) => setFormData({ ...formData, foundingYear: e.target.value })}
            />
            <label htmlFor="investmentFocus" className="block text-sm font-medium text-gray-700 mt-4">
              Program Focus
            </label>
            <input
              type="text"
              id="investmentFocus"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.investmentFocus || ''}
              onChange={(e) => setFormData({ ...formData, investmentFocus: e.target.value })}
            />
          </div>
        );
      case 'incubator':
        return (
          <div>
            <label htmlFor="foundingYear" className="block text-sm font-medium text-gray-700">
              Founding Year
            </label>
            <input
              type="number"
              id="foundingYear"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.foundingYear || ''}
              onChange={(e) => setFormData({ ...formData, foundingYear: e.target.value })}
            />
            <label htmlFor="investmentFocus" className="block text-sm font-medium text-gray-700 mt-4">
              Incubation Focus
            </label>
            <input
              type="text"
              id="investmentFocus"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.investmentFocus || ''}
              onChange={(e) => setFormData({ ...formData, investmentFocus: e.target.value })}
            />
          </div>
        );
      case 'corporate':
        return (
          <div>
            <label htmlFor="foundingYear" className="block text-sm font-medium text-gray-700">
              Industry
            </label>
            <input
              type="text"
              id="industry"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g. Technology, Healthcare, Finance"
              value={formData.foundingYear || ''}
              onChange={(e) => setFormData({ ...formData, foundingYear: e.target.value })}
            />
          </div>
        );
      case 'government':
        return (
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department/Agency
            </label>
            <input
              type="text"
              id="department"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g. Ministry of Innovation, Economic Development"
              value={formData.researchArea || ''}
              onChange={(e) => setFormData({ ...formData, researchArea: e.target.value })}
            />
          </div>
        );
      case 'individual':
        return (
          <div>
            <label htmlFor="expertise" className="block text-sm font-medium text-gray-700">
              Professional Background
            </label>
            <input
              type="text"
              id="expertise"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g. Software Engineer, Researcher, Entrepreneur"
              value={formData.researchArea || ''}
              onChange={(e) => setFormData({ ...formData, researchArea: e.target.value })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderCollaboratorTypeSelector = () => {
    if (modalType !== 'initiative' || !onCollaboratorTypeChange) return null;
    
    // If user is authenticated, show their role with a message
    if (isAuthenticated && user && isInnovatorType(user.role)) {
      return (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              I am:
            </label>
            <span className="text-xs text-gray-500">
              Based on your profile
            </span>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3 flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-700">
              {getCollaboratorTypeLabel()}
            </span>
            <button
              type="button"
              className="text-xs text-indigo-600 hover:text-indigo-800 underline focus:outline-none"
              onClick={() => {
                // This allows the user to change their role for this submission if needed
                document.getElementById('change-role-section')?.classList.remove('hidden');
              }}
            >
              Change for this submission
            </button>
          </div>
          
          <div id="change-role-section" className="hidden mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select a different role:
              </label>
              <span className="text-xs text-gray-500">
                Only for this submission
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {renderRoleButtons()}
            </div>
          </div>
        </div>
      );
    }
    
    // If user is not authenticated, show the regular selector
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          I am a:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {renderRoleButtons()}
        </div>
      </div>
    );
  };
  
  // Extract the role buttons into a separate function for reuse
  const renderRoleButtons = () => {
    // Ensure onCollaboratorTypeChange is defined
    if (!onCollaboratorTypeChange) return null;
    
    const handleRoleChange = (type: CollaboratorType) => {
      console.log('Role button clicked:', type);
      onCollaboratorTypeChange(type);
      setFormData(prev => ({ ...prev, collaboratorType: type }));
    };
    
    return (
      <>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center ${
            collaboratorType === 'startup'
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
              : 'bg-white text-gray-700 border-gray-300'
          } border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          onClick={() => handleRoleChange('startup')}
        >
          Startup
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center ${
            collaboratorType === 'research'
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
              : 'bg-white text-gray-700 border-gray-300'
          } border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          onClick={() => handleRoleChange('research')}
        >
          Research
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center ${
            collaboratorType === 'corporate'
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
              : 'bg-white text-gray-700 border-gray-300'
          } border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          onClick={() => handleRoleChange('corporate')}
        >
          Corporate
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center ${
            collaboratorType === 'government'
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
              : 'bg-white text-gray-700 border-gray-300'
          } border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          onClick={() => handleRoleChange('government')}
        >
          Government
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center ${
            collaboratorType === 'investor'
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
              : 'bg-white text-gray-700 border-gray-300'
          } border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          onClick={() => handleRoleChange('investor')}
        >
          Investor
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center ${
            collaboratorType === 'accelerator'
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
              : 'bg-white text-gray-700 border-gray-300'
          } border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          onClick={() => handleRoleChange('accelerator')}
        >
          Accelerator
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center ${
            collaboratorType === 'incubator'
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
              : 'bg-white text-gray-700 border-gray-300'
          } border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          onClick={() => handleRoleChange('incubator')}
        >
          Incubator
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center ${
            collaboratorType === 'individual'
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
              : 'bg-white text-gray-700 border-gray-300'
          } border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          onClick={() => handleRoleChange('individual')}
        >
          Individual
        </button>
      </>
    );
  };

  const renderExpertiseCheckboxes = () => {
    if (modalType === 'position' && request) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relevant Expertise
          </label>
          <div className="space-y-2">
            {request.expertise.map((skill) => (
              <label key={skill} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={formData.expertise.includes(skill)}
                  onChange={(e) => {
                    const newExpertise = e.target.checked
                      ? [...formData.expertise, skill]
                      : formData.expertise.filter(s => s !== skill);
                    setFormData({ ...formData, expertise: newExpertise });
                  }}
                />
                <span className="ml-2 text-sm text-gray-700">{skill}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div>
        <label htmlFor="expertise" className="block text-sm font-medium text-gray-700">
          Areas of Expertise
        </label>
        <input
          type="text"
          id="expertise"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="e.g. AI, IoT, Renewable Energy"
          value={formData.expertiseText || ''}
          onChange={(e) => setFormData({ ...formData, expertiseText: e.target.value })}
        />
        <p className="mt-1 text-xs text-gray-500">Separate multiple areas with commas</p>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {modalType === 'position' 
            ? `Express Interest: ${request?.role}` 
            : 'Express Initiative Interest'}
        </h2>
        
        {modalType === 'position' && (
          <div className="mb-4">
            <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-700/10">
              Open Position
            </span>
          </div>
        )}

        {modalType === 'initiative' && (
          <div className="mb-4">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Initiative Collaborator
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderCollaboratorTypeSelector()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {collaboratorType === 'individual' ? 'Full Name' : 'Contact Person'}
              </label>
              <input
                type="text"
                id="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                {getCollaboratorTypeLabel()}
              </label>
              <input
                type="text"
                id="organization"
                required={collaboratorType !== 'individual'}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />
            </div>

            <div>
              {getAdditionalFields()}
            </div>
          </div>

          {renderExpertiseCheckboxes()}

          <div className="col-span-2">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              {modalType === 'position'
                ? 'Why are you interested in this position?'
                : collaboratorType === 'investor' 
                  ? 'Investment Interest' 
                  : 'How would you like to contribute?'}
            </label>
            <textarea
              id="message"
              rows={4}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={
                modalType === 'position'
                  ? "Describe your qualifications and interest in this position..."
                  : collaboratorType === 'investor' 
                    ? "Describe your investment interests and potential contribution..."
                    : "Describe how you or your organization can contribute to this initiative..."
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Submit Interest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}