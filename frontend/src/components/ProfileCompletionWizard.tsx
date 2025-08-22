import React, { useState, useEffect } from 'react';
import { 
  User, 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  Star,
  MapPin,
  Briefcase,
  Link as LinkIcon,
  Clock,
  Globe,
  Target,
  Users
} from 'lucide-react';
import {
  User as UserType,
  ProfileUpdateDto,
  AvailabilityStatus,
  WorkType,
  ExperienceLevel,
  Language,
  WorkingHours,
  AVAILABILITY_STATUS_OPTIONS,
  WORK_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  COMMON_INDUSTRIES,
  COMPANY_STAGES
} from '../types/user';
import { getCurrentUser, changePassword } from '../services/auth';

interface ProfileCompletionWizardProps {
  user?: UserType;
  onComplete: (updatedUser: UserType) => void;
  onClose: () => void;
  isModal?: boolean;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: string[];
  component: React.ComponentType<WizardStepProps>;
}

interface WizardStepProps {
  formData: ProfileUpdateDto;
  setFormData: (data: ProfileUpdateDto) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const ProfileCompletionWizard: React.FC<ProfileCompletionWizardProps> = ({
  user,
  onComplete,
  onClose,
  isModal = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProfileUpdateDto>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data with existing user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        organization: user.organization,
        position: user.position,
        location: user.location,
        interests: user.interests || [],
        availabilityStatus: user.availabilityStatus,
        hourlyRate: user.hourlyRate,
        currency: user.currency || 'USD',
        preferredWorkType: user.preferredWorkType,
        experienceLevel: user.experienceLevel,
        linkedinUrl: user.linkedinUrl,
        githubUrl: user.githubUrl,
        websiteUrl: user.websiteUrl,
        portfolioUrl: user.portfolioUrl,
        languages: user.languages || [],
        timeZone: user.timeZone,
        workingHours: user.workingHours,
        lookingForCofounder: user.lookingForCofounder,
        lookingForTeamMembers: user.lookingForTeamMembers,
        openToMentoring: user.openToMentoring,
        seekingMentor: user.seekingMentor,
        preferredIndustries: user.preferredIndustries || [],
        preferredCompanyStages: user.preferredCompanyStages || [],
      });
    }
  }, [user]);

  const steps: WizardStep[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Let\'s start with your basic profile information',
      icon: User,
      fields: ['firstName', 'lastName', 'bio', 'location'],
      component: BasicInfoStep,
    },
    {
      id: 'professional',
      title: 'Professional Background',
      description: 'Tell us about your professional experience',
      icon: Briefcase,
      fields: ['organization', 'position', 'experienceLevel', 'interests'],
      component: ProfessionalStep,
    },
    {
      id: 'availability',
      title: 'Work Preferences',
      description: 'Share your availability and work preferences',
      icon: Clock,
      fields: ['availabilityStatus', 'preferredWorkType', 'hourlyRate', 'workingHours'],
      component: AvailabilityStep,
    },
    {
      id: 'links',
      title: 'Professional Links',
      description: 'Connect your professional profiles and portfolio',
      icon: LinkIcon,
      fields: ['linkedinUrl', 'githubUrl', 'websiteUrl', 'portfolioUrl'],
      component: LinksStep,
    },
    {
      id: 'preferences',
      title: 'Collaboration Preferences',
      description: 'What kind of opportunities interest you?',
      icon: Target,
      fields: ['lookingForCofounder', 'lookingForTeamMembers', 'openToMentoring', 'preferredIndustries'],
      component: PreferencesStep,
    },
    {
      id: 'localization',
      title: 'Languages & Location',
      description: 'Help others understand your global reach',
      icon: Globe,
      fields: ['languages', 'timeZone'],
      component: LocalizationStep,
    },
  ];

  const currentStepData = steps[currentStep];
  const StepComponent = currentStepData.component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Here you would call your API to update the user profile
      // For now, we'll simulate this
      const updatedUser = { ...user, ...formData } as UserType;
      onComplete(updatedUser);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletionPercentage = (): number => {
    const totalFields = steps.reduce((total, step) => total + step.fields.length, 0);
    const completedFields = steps.reduce((completed, step) => {
      return completed + step.fields.filter(field => {
        const value = formData[field as keyof ProfileUpdateDto];
        return value !== undefined && value !== null && value !== '' && 
               (Array.isArray(value) ? value.length > 0 : true);
      }).length;
    }, 0);
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const content = (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{calculateCompletionPercentage()}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isCompleted
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : isCurrent
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
        <p className="text-gray-600">{currentStepData.description}</p>
      </div>

      {/* Step Content */}
      <div className="max-w-md mx-auto">
        <StepComponent
          formData={formData}
          setFormData={setFormData}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === steps.length - 1}
        />
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Profile</h1>
      {content}
    </div>
  );
};

// Step Components
const BasicInfoStep: React.FC<WizardStepProps> = ({ formData, setFormData, onNext, isFirstStep }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          First Name *
        </label>
        <input
          type="text"
          value={formData.firstName || ''}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Last Name *
        </label>
        <input
          type="text"
          value={formData.lastName || ''}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Bio
      </label>
      <textarea
        value={formData.bio || ''}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={4}
        placeholder="Tell us about yourself, your background, and what you're passionate about..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Location
      </label>
      <input
        type="text"
        value={formData.location || ''}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="City, Country"
      />
    </div>

    <div className="flex justify-end">
      <button
        onClick={onNext}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2"
      >
        Next <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const ProfessionalStep: React.FC<WizardStepProps> = ({ 
  formData, 
  setFormData, 
  onNext, 
  onPrevious, 
  isFirstStep 
}) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Organization
      </label>
      <input
        type="text"
        value={formData.organization || ''}
        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Your current or recent company"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Position
      </label>
      <input
        type="text"
        value={formData.position || ''}
        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Your current or recent job title"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Experience Level
      </label>
      <select
        value={formData.experienceLevel || ExperienceLevel.MID}
        onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as ExperienceLevel })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {EXPERIENCE_LEVEL_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Interests
      </label>
      <input
        type="text"
        value={formData.interests?.join(', ') || ''}
        onChange={(e) => setFormData({ 
          ...formData, 
          interests: e.target.value.split(',').map(i => i.trim()).filter(i => i) 
        })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="AI, Blockchain, Healthcare, etc. (comma separated)"
      />
    </div>

    <div className="flex justify-between">
      <button
        onClick={onPrevious}
        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Previous
      </button>
      <button
        onClick={onNext}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2"
      >
        Next <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const AvailabilityStep: React.FC<WizardStepProps> = ({ 
  formData, 
  setFormData, 
  onNext, 
  onPrevious 
}) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Availability Status
      </label>
      <select
        value={formData.availabilityStatus || AvailabilityStatus.AVAILABLE}
        onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value as AvailabilityStatus })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {AVAILABILITY_STATUS_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Preferred Work Type
      </label>
      <select
        value={formData.preferredWorkType || WorkType.FULLTIME}
        onChange={(e) => setFormData({ ...formData, preferredWorkType: e.target.value as WorkType })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {WORK_TYPE_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hourly Rate (Optional)
        </label>
        <input
          type="number"
          min="0"
          value={formData.hourlyRate || ''}
          onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || undefined })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Currency
        </label>
        <select
          value={formData.currency || 'USD'}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="CAD">CAD</option>
          <option value="AUD">AUD</option>
        </select>
      </div>
    </div>

    <div className="flex justify-between">
      <button
        onClick={onPrevious}
        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Previous
      </button>
      <button
        onClick={onNext}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2"
      >
        Next <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const LinksStep: React.FC<WizardStepProps> = ({ 
  formData, 
  setFormData, 
  onNext, 
  onPrevious 
}) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        LinkedIn URL
      </label>
      <input
        type="url"
        value={formData.linkedinUrl || ''}
        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="https://linkedin.com/in/yourprofile"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        GitHub URL
      </label>
      <input
        type="url"
        value={formData.githubUrl || ''}
        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="https://github.com/yourusername"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Website URL
      </label>
      <input
        type="url"
        value={formData.websiteUrl || ''}
        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="https://yourwebsite.com"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Portfolio URL
      </label>
      <input
        type="url"
        value={formData.portfolioUrl || ''}
        onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="https://yourportfolio.com"
      />
    </div>

    <div className="flex justify-between">
      <button
        onClick={onPrevious}
        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Previous
      </button>
      <button
        onClick={onNext}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2"
      >
        Next <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const PreferencesStep: React.FC<WizardStepProps> = ({ 
  formData, 
  setFormData, 
  onNext, 
  onPrevious 
}) => (
  <div className="space-y-4">
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-gray-900">What are you looking for?</h3>
      
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.lookingForCofounder || false}
            onChange={(e) => setFormData({ ...formData, lookingForCofounder: e.target.checked })}
            className="mr-3"
          />
          <span>Looking for co-founder</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.lookingForTeamMembers || false}
            onChange={(e) => setFormData({ ...formData, lookingForTeamMembers: e.target.checked })}
            className="mr-3"
          />
          <span>Looking for team members</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.openToMentoring || false}
            onChange={(e) => setFormData({ ...formData, openToMentoring: e.target.checked })}
            className="mr-3"
          />
          <span>Open to mentoring others</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.seekingMentor || false}
            onChange={(e) => setFormData({ ...formData, seekingMentor: e.target.checked })}
            className="mr-3"
          />
          <span>Seeking a mentor</span>
        </label>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Preferred Industries
      </label>
      <input
        type="text"
        value={formData.preferredIndustries?.join(', ') || ''}
        onChange={(e) => setFormData({ 
          ...formData, 
          preferredIndustries: e.target.value.split(',').map(i => i.trim()).filter(i => i) 
        })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Technology, Healthcare, Finance, etc. (comma separated)"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Preferred Company Stages
      </label>
      <input
        type="text"
        value={formData.preferredCompanyStages?.join(', ') || ''}
        onChange={(e) => setFormData({ 
          ...formData, 
          preferredCompanyStages: e.target.value.split(',').map(i => i.trim()).filter(i => i) 
        })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Seed, Series A, Growth, etc. (comma separated)"
      />
    </div>

    <div className="flex justify-between">
      <button
        onClick={onPrevious}
        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Previous
      </button>
      <button
        onClick={onNext}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2"
      >
        Next <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const LocalizationStep: React.FC<WizardStepProps> = ({ 
  formData, 
  setFormData, 
  onNext, 
  onPrevious, 
  isLastStep 
}) => {
  const [newLanguage, setNewLanguage] = useState({ language: '', fluency: 'intermediate' as const });

  const addLanguage = () => {
    if (newLanguage.language.trim()) {
      const currentLanguages = formData.languages || [];
      setFormData({
        ...formData,
        languages: [...currentLanguages, { ...newLanguage, language: newLanguage.language.trim() }]
      });
      setNewLanguage({ language: '', fluency: 'intermediate' });
    }
  };

  const removeLanguage = (index: number) => {
    const currentLanguages = formData.languages || [];
    setFormData({
      ...formData,
      languages: currentLanguages.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time Zone
        </label>
        <select
          value={formData.timeZone || ''}
          onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select timezone...</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time (EST/EDT)</option>
          <option value="America/Chicago">Central Time (CST/CDT)</option>
          <option value="America/Denver">Mountain Time (MST/MDT)</option>
          <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
          <option value="Europe/London">London (GMT/BST)</option>
          <option value="Europe/Paris">Central European Time</option>
          <option value="Asia/Tokyo">Japan (JST)</option>
          <option value="Asia/Shanghai">China (CST)</option>
          <option value="Asia/Kolkata">India (IST)</option>
          <option value="Australia/Sydney">Australia Eastern Time</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Languages
        </label>
        <div className="space-y-2">
          {(formData.languages || []).map((lang, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
              <span className="text-sm">
                {lang.language} - {lang.fluency}
              </span>
              <button
                type="button"
                onClick={() => removeLanguage(index)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newLanguage.language}
              onChange={(e) => setNewLanguage({ ...newLanguage, language: e.target.value })}
              placeholder="Language name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <select
              value={newLanguage.fluency}
              onChange={(e) => setNewLanguage({ ...newLanguage, fluency: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="basic">Basic</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="native">Native</option>
            </select>
            <button
              type="button"
              onClick={addLanguage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={onNext}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex items-center gap-2"
        >
          {isLastStep ? 'Complete Profile' : 'Next'} <CheckCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProfileCompletionWizard;
