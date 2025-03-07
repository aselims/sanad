import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Innovator, InnovatorBase, StartupInnovator, InvestorInnovator, ResearchInnovator, IndividualInnovator } from '../types';
import { ROLE_DISPLAY_NAMES, INNOVATOR_TYPES_ARRAY, InnovatorType } from '../constants/roles';

interface EditProfileModalProps {
  user: Innovator;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: Partial<Innovator>) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  // Common fields for all innovator types
  const [commonFields, setCommonFields] = useState<Partial<InnovatorBase>>({
    name: user.name || '',
    email: user.email || '',
    type: user.type,
    description: user.description || '',
    location: user.location || '',
    website: user.website || '',
    profileImage: user.profileImage || '',
    social: {
      linkedin: user.social?.linkedin || '',
      twitter: user.social?.twitter || '',
      github: user.social?.github || '',
    },
    expertise: user.expertise || [],
    tags: user.tags || [],
    organization: user.organization || ''
  });

  // Type-specific fields
  const [startupFields, setStartupFields] = useState({
    foundedYear: user.type === 'startup' ? (user as StartupInnovator).foundedYear || '' : '',
    teamSize: user.type === 'startup' ? (user as StartupInnovator).teamSize || '' : '',
    fundingStage: user.type === 'startup' ? (user as StartupInnovator).fundingStage || '' : '',
    fundingAmount: user.type === 'startup' ? (user as StartupInnovator).fundingAmount || '' : '',
    revenue: user.type === 'startup' ? (user as StartupInnovator).revenue || '' : '',
    productStage: user.type === 'startup' ? (user as StartupInnovator).productStage || '' : '',
    patents: user.type === 'startup' ? (user as StartupInnovator).patents || [] : [],
    metrics: user.type === 'startup' ? (user as StartupInnovator).metrics || {} : {}
  });

  const [investorFields, setInvestorFields] = useState({
    investmentStage: user.type === 'investor' ? (user as InvestorInnovator).investmentStage || [] : [],
    ticketSize: user.type === 'investor' ? (user as InvestorInnovator).ticketSize || '' : '',
    portfolioSize: user.type === 'investor' ? (user as InvestorInnovator).portfolioSize || '' : '',
    sectors: user.type === 'investor' ? (user as InvestorInnovator).sectors || [] : [],
    investmentCriteria: user.type === 'investor' ? (user as InvestorInnovator).investmentCriteria || '' : '',
    successfulExits: user.type === 'investor' ? (user as InvestorInnovator).successfulExits || 0 : 0,
    geographicFocus: user.type === 'investor' ? (user as InvestorInnovator).geographicFocus || [] : []
  });

  const [researchFields, setResearchFields] = useState({
    institution: user.type === 'research' ? (user as ResearchInnovator).institution || '' : '',
    department: user.type === 'research' ? (user as ResearchInnovator).department || '' : '',
    researchAreas: user.type === 'research' ? (user as ResearchInnovator).researchAreas || [] : [],
    publications: user.type === 'research' ? (user as ResearchInnovator).publications || [] : [],
    grants: user.type === 'research' ? (user as ResearchInnovator).grants || [] : [],
    labSize: user.type === 'research' ? (user as ResearchInnovator).labSize || '' : ''
  });

  const [individualFields, setIndividualFields] = useState({
    skills: user.type === 'individual' ? (user as IndividualInnovator).skills || [] : [],
    experience: user.type === 'individual' ? (user as IndividualInnovator).experience || [] : [],
    education: user.type === 'individual' ? (user as IndividualInnovator).education || [] : [],
    certifications: user.type === 'individual' ? (user as IndividualInnovator).certifications || [] : []
  });

  const handleCommonFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCommonFields(prev => ({
        ...prev,
        [parent]: { ...prev[parent as keyof typeof prev], [child]: value }
      }));
    } else {
      setCommonFields(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeSpecificFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    switch (commonFields.type) {
      case 'startup':
        setStartupFields(prev => ({ ...prev, [name]: value }));
        break;
      case 'investor':
        setInvestorFields(prev => ({ ...prev, [name]: value }));
        break;
      case 'research':
        setResearchFields(prev => ({ ...prev, [name]: value }));
        break;
      case 'individual':
        setIndividualFields(prev => ({ ...prev, [name]: value }));
        break;
    }
  };

  const renderTypeSpecificFields = () => {
    switch (commonFields.type) {
      case 'startup':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Startup Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700">Founded Year</label>
                <input
                  type="number"
                  name="foundedYear"
                  value={startupFields.foundedYear}
                  onChange={handleTypeSpecificFieldChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700">Team Size</label>
                <input
                  type="text"
                  name="teamSize"
                  value={startupFields.teamSize}
                  onChange={handleTypeSpecificFieldChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="fundingStage" className="block text-sm font-medium text-gray-700">Funding Stage</label>
                <select
                  name="fundingStage"
                  value={startupFields.fundingStage}
                  onChange={handleTypeSpecificFieldChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Stage</option>
                  <option value="pre-seed">Pre-seed</option>
                  <option value="seed">Seed</option>
                  <option value="series-a">Series A</option>
                  <option value="series-b">Series B</option>
                  <option value="series-c">Series C+</option>
                </select>
              </div>
              <div>
                <label htmlFor="productStage" className="block text-sm font-medium text-gray-700">Product Stage</label>
                <select
                  name="productStage"
                  value={startupFields.productStage}
                  onChange={handleTypeSpecificFieldChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Stage</option>
                  <option value="concept">Concept</option>
                  <option value="prototype">Prototype</option>
                  <option value="mvp">MVP</option>
                  <option value="market">In Market</option>
                  <option value="scaling">Scaling</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'investor':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Investor Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ticketSize" className="block text-sm font-medium text-gray-700">Ticket Size Range</label>
                <input
                  type="text"
                  name="ticketSize"
                  value={investorFields.ticketSize}
                  onChange={handleTypeSpecificFieldChange}
                  placeholder="e.g., $100K - $500K"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="portfolioSize" className="block text-sm font-medium text-gray-700">Portfolio Size</label>
                <input
                  type="text"
                  name="portfolioSize"
                  value={investorFields.portfolioSize}
                  onChange={handleTypeSpecificFieldChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="investmentCriteria" className="block text-sm font-medium text-gray-700">Investment Criteria</label>
                <textarea
                  name="investmentCriteria"
                  value={investorFields.investmentCriteria}
                  onChange={handleTypeSpecificFieldChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        );

      case 'research':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Research Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-gray-700">Institution</label>
                <input
                  type="text"
                  name="institution"
                  value={researchFields.institution}
                  onChange={handleTypeSpecificFieldChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  name="department"
                  value={researchFields.department}
                  onChange={handleTypeSpecificFieldChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="researchAreas" className="block text-sm font-medium text-gray-700">Research Areas</label>
                <input
                  type="text"
                  name="researchAreas"
                  value={researchFields.researchAreas.join(', ')}
                  onChange={(e) => setResearchFields(prev => ({
                    ...prev,
                    researchAreas: e.target.value.split(',').map(area => area.trim())
                  }))}
                  placeholder="Separate areas with commas"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        );

      case 'individual':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Professional Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills</label>
                <input
                  type="text"
                  name="skills"
                  value={individualFields.skills.join(', ')}
                  onChange={(e) => setIndividualFields(prev => ({
                    ...prev,
                    skills: e.target.value.split(',').map(item => item.trim())
                  }))}
                  placeholder="Separate skills with commas"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseFields = {
      name: commonFields.name,
      email: commonFields.email,
      description: commonFields.description,
      location: commonFields.location,
      website: commonFields.website,
      profileImage: commonFields.profileImage,
      social: commonFields.social,
      expertise: commonFields.expertise,
      tags: commonFields.tags,
      organization: commonFields.organization
    };

    let updatedUser: Partial<Innovator>;
    
    switch (commonFields.type) {
      case 'startup':
        updatedUser = Object.assign({}, baseFields, {
          type: 'startup' as const,
          foundedYear: startupFields.foundedYear,
          teamSize: startupFields.teamSize,
          fundingStage: startupFields.fundingStage,
          fundingAmount: startupFields.fundingAmount,
          revenue: startupFields.revenue,
          productStage: startupFields.productStage,
          patents: startupFields.patents,
          metrics: startupFields.metrics
        }) as Partial<StartupInnovator>;
        break;
      case 'investor':
        updatedUser = Object.assign({}, baseFields, {
          type: 'investor' as const,
          investmentStage: investorFields.investmentStage,
          ticketSize: investorFields.ticketSize,
          portfolioSize: investorFields.portfolioSize,
          sectors: investorFields.sectors,
          investmentCriteria: investorFields.investmentCriteria,
          successfulExits: investorFields.successfulExits,
          geographicFocus: investorFields.geographicFocus
        }) as Partial<InvestorInnovator>;
        break;
      case 'research':
        updatedUser = Object.assign({}, baseFields, {
          type: 'research' as const,
          institution: researchFields.institution,
          department: researchFields.department,
          researchAreas: researchFields.researchAreas,
          publications: researchFields.publications,
          grants: researchFields.grants,
          labSize: researchFields.labSize
        }) as Partial<ResearchInnovator>;
        break;
      default:
        updatedUser = Object.assign({}, baseFields, {
          type: 'individual' as const,
          skills: individualFields.skills,
          experience: individualFields.experience,
          education: individualFields.education,
          certifications: individualFields.certifications
        }) as Partial<IndividualInnovator>;
    }
    
    onSave(updatedUser);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit} className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Profile</h3>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Common Fields */}
              <div>
                <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={commonFields.name}
                      onChange={handleCommonFieldChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Profile Type</label>
                    <select
                      name="type"
                      value={commonFields.type}
                      onChange={handleCommonFieldChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      {INNOVATOR_TYPES_ARRAY.map(type => (
                        <option key={type} value={type}>
                          {ROLE_DISPLAY_NAMES[type]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={commonFields.description}
                      onChange={handleCommonFieldChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Type-specific Fields */}
              {renderTypeSpecificFields()}

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900">Contact Information</h4>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={commonFields.location}
                      onChange={handleCommonFieldChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={commonFields.website}
                      onChange={handleCommonFieldChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="text-lg font-medium text-gray-900">Social Links</h4>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="social.linkedin" className="block text-sm font-medium text-gray-700">LinkedIn</label>
                    <input
                      type="url"
                      name="social.linkedin"
                      value={commonFields.social?.linkedin || ''}
                      onChange={handleCommonFieldChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="social.twitter" className="block text-sm font-medium text-gray-700">Twitter</label>
                    <input
                      type="url"
                      name="social.twitter"
                      value={commonFields.social?.twitter || ''}
                      onChange={handleCommonFieldChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="social.github" className="block text-sm font-medium text-gray-700">GitHub</label>
                    <input
                      type="url"
                      name="social.github"
                      value={commonFields.social?.github || ''}
                      onChange={handleCommonFieldChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal; 