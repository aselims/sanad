import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Save, 
  Send, 
  AlertCircle,
  Upload,
  X 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface IdeaFormData {
  // Step 1: Basic Info
  title: string;
  description: string;
  category: string;
  targetAudience: string;
  potentialImpact: string;
  
  // Step 2: Business Model
  businessModel: string;
  targetMarket: string;
  competitiveAdvantage: string;
  
  // Step 3: Resources & Timeline
  resourcesNeeded: string;
  fundingNeeded: number | '';
  timeline: string;
  
  // Step 4: Risks & Success Metrics
  riskFactors: string[];
  successMetrics: string[];
  
  // Step 5: Attachments (optional)
  attachments: string[];
}

const initialFormData: IdeaFormData = {
  title: '',
  description: '',
  category: '',
  targetAudience: '',
  potentialImpact: '',
  businessModel: '',
  targetMarket: '',
  competitiveAdvantage: '',
  resourcesNeeded: '',
  fundingNeeded: '',
  timeline: '',
  riskFactors: [''],
  successMetrics: [''],
  attachments: [],
};

const categories = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Environment',
  'Social Impact',
  'E-commerce',
  'Manufacturing',
  'Energy',
  'Transportation',
  'Food & Agriculture',
  'Entertainment',
  'Other'
];

const timelines = [
  '3-6 months',
  '6-12 months',
  '1-2 years',
  '2-3 years',
  '3+ years'
];

interface IdeaSubmissionFormProps {
  onClose: () => void;
  onSubmit?: (idea: any) => void;
  initialData?: Partial<IdeaFormData>;
}

export const IdeaSubmissionForm: React.FC<IdeaSubmissionFormProps> = ({
  onClose,
  onSubmit,
  initialData
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<IdeaFormData>({
    ...initialFormData,
    ...initialData
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedAsDraft, setSavedAsDraft] = useState(false);

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Core idea details' },
    { number: 2, title: 'Business Model', description: 'Market & competition' },
    { number: 3, title: 'Resources', description: 'Timeline & funding' },
    { number: 4, title: 'Analysis', description: 'Risks & success metrics' },
    { number: 5, title: 'Review', description: 'Final review & submit' },
  ];

  const updateFormData = (field: keyof IdeaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addArrayItem = (field: 'riskFactors' | 'successMetrics') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'riskFactors' | 'successMetrics', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'riskFactors' | 'successMetrics', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.targetAudience.trim()) newErrors.targetAudience = 'Target audience is required';
        if (!formData.potentialImpact.trim()) newErrors.potentialImpact = 'Potential impact is required';
        break;
      case 2:
        if (!formData.businessModel.trim()) newErrors.businessModel = 'Business model is required';
        if (!formData.targetMarket.trim()) newErrors.targetMarket = 'Target market is required';
        if (!formData.competitiveAdvantage.trim()) newErrors.competitiveAdvantage = 'Competitive advantage is required';
        break;
      case 3:
        if (!formData.resourcesNeeded.trim()) newErrors.resourcesNeeded = 'Resources needed is required';
        if (!formData.timeline) newErrors.timeline = 'Timeline is required';
        break;
      case 4:
        const validRisks = formData.riskFactors.filter(risk => risk.trim());
        const validMetrics = formData.successMetrics.filter(metric => metric.trim());
        if (validRisks.length === 0) newErrors.riskFactors = 'At least one risk factor is required';
        if (validMetrics.length === 0) newErrors.successMetrics = 'At least one success metric is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const saveAsDraft = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          status: 'draft',
          riskFactors: formData.riskFactors.filter(risk => risk.trim()),
          successMetrics: formData.successMetrics.filter(metric => metric.trim()),
        }),
      });

      if (response.ok) {
        setSavedAsDraft(true);
        setTimeout(() => setSavedAsDraft(false), 3000);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitIdea = async () => {
    if (!validateStep(4)) return;

    try {
      setIsSubmitting(true);
      const submissionData = {
        ...formData,
        status: 'draft',
        riskFactors: formData.riskFactors.filter(risk => risk.trim()),
        successMetrics: formData.successMetrics.filter(metric => metric.trim()),
      };

      // First create or update the idea
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const result = await response.json();
        const ideaId = result.idea.id;

        // Then complete the submission
        const completeResponse = await fetch(`/api/ideas/${ideaId}/complete`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (completeResponse.ok) {
          onSubmit?.(result.idea);
          onClose();
        } else {
          throw new Error('Failed to complete submission');
        }
      } else {
        throw new Error('Failed to create idea');
      }
    } catch (error) {
      console.error('Error submitting idea:', error);
      setErrors({ submit: 'Failed to submit idea. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Idea Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter a compelling title for your idea"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Provide a detailed description of your idea"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          value={formData.category}
          onChange={(e) => updateFormData('category', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Audience *
        </label>
        <textarea
          value={formData.targetAudience}
          onChange={(e) => updateFormData('targetAudience', e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.targetAudience ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Who is your target audience? Be specific."
        />
        {errors.targetAudience && <p className="text-red-500 text-sm mt-1">{errors.targetAudience}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Potential Impact *
        </label>
        <textarea
          value={formData.potentialImpact}
          onChange={(e) => updateFormData('potentialImpact', e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.potentialImpact ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="What impact will this idea have? Include metrics if possible."
        />
        {errors.potentialImpact && <p className="text-red-500 text-sm mt-1">{errors.potentialImpact}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Model *
        </label>
        <textarea
          value={formData.businessModel}
          onChange={(e) => updateFormData('businessModel', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.businessModel ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="How will you make money? Describe your revenue model, pricing strategy, and key partnerships."
        />
        {errors.businessModel && <p className="text-red-500 text-sm mt-1">{errors.businessModel}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Market *
        </label>
        <textarea
          value={formData.targetMarket}
          onChange={(e) => updateFormData('targetMarket', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.targetMarket ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe your target market size, growth potential, and market dynamics."
        />
        {errors.targetMarket && <p className="text-red-500 text-sm mt-1">{errors.targetMarket}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Competitive Advantage *
        </label>
        <textarea
          value={formData.competitiveAdvantage}
          onChange={(e) => updateFormData('competitiveAdvantage', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.competitiveAdvantage ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="What makes your idea unique? How will you differentiate from competitors?"
        />
        {errors.competitiveAdvantage && <p className="text-red-500 text-sm mt-1">{errors.competitiveAdvantage}</p>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resources Needed *
        </label>
        <textarea
          value={formData.resourcesNeeded}
          onChange={(e) => updateFormData('resourcesNeeded', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.resourcesNeeded ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="What resources do you need? Include team members, technology, equipment, etc."
        />
        {errors.resourcesNeeded && <p className="text-red-500 text-sm mt-1">{errors.resourcesNeeded}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Funding Needed (USD)
        </label>
        <input
          type="number"
          value={formData.fundingNeeded}
          onChange={(e) => updateFormData('fundingNeeded', e.target.value ? parseFloat(e.target.value) : '')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter amount in USD (optional)"
          min="0"
          step="1000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timeline *
        </label>
        <select
          value={formData.timeline}
          onChange={(e) => updateFormData('timeline', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.timeline ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select expected timeline</option>
          {timelines.map((timeline) => (
            <option key={timeline} value={timeline}>
              {timeline}
            </option>
          ))}
        </select>
        {errors.timeline && <p className="text-red-500 text-sm mt-1">{errors.timeline}</p>}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Risk Factors *
        </label>
        {errors.riskFactors && <p className="text-red-500 text-sm mb-2">{errors.riskFactors}</p>}
        {formData.riskFactors.map((risk, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={risk}
              onChange={(e) => updateArrayItem('riskFactors', index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Risk factor ${index + 1}`}
            />
            {formData.riskFactors.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('riskFactors', index)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('riskFactors')}
          className="text-blue-500 hover:text-blue-700 text-sm"
        >
          + Add another risk factor
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Success Metrics *
        </label>
        {errors.successMetrics && <p className="text-red-500 text-sm mb-2">{errors.successMetrics}</p>}
        {formData.successMetrics.map((metric, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={metric}
              onChange={(e) => updateArrayItem('successMetrics', index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Success metric ${index + 1}`}
            />
            {formData.successMetrics.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('successMetrics', index)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('successMetrics')}
          className="text-blue-500 hover:text-blue-700 text-sm"
        >
          + Add another success metric
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Review Your Submission</h3>
        <p className="text-blue-700 text-sm">
          Please review all the information below. Once submitted, your idea will be reviewed by our team.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900">Basic Information</h4>
          <div className="text-sm text-gray-600 mt-1">
            <p><strong>Title:</strong> {formData.title}</p>
            <p><strong>Category:</strong> {formData.category}</p>
            <p><strong>Target Audience:</strong> {formData.targetAudience}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Business Model</h4>
          <div className="text-sm text-gray-600 mt-1">
            <p><strong>Business Model:</strong> {formData.businessModel.substring(0, 100)}...</p>
            <p><strong>Target Market:</strong> {formData.targetMarket.substring(0, 100)}...</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Resources & Timeline</h4>
          <div className="text-sm text-gray-600 mt-1">
            <p><strong>Timeline:</strong> {formData.timeline}</p>
            {formData.fundingNeeded && (
              <p><strong>Funding:</strong> ${formData.fundingNeeded.toLocaleString()}</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Analysis</h4>
          <div className="text-sm text-gray-600 mt-1">
            <p><strong>Risk Factors:</strong> {formData.riskFactors.filter(r => r.trim()).length} identified</p>
            <p><strong>Success Metrics:</strong> {formData.successMetrics.filter(m => m.trim()).length} defined</p>
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Submit New Idea</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.number === currentStep
                          ? 'bg-blue-600 text-white'
                          : step.number < currentStep
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {step.number < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">{step.title}</div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div className="h-px bg-gray-300"></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
              )}
              
              {currentStep < 5 && (
                <button
                  onClick={saveAsDraft}
                  disabled={isSubmitting}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save Draft
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {savedAsDraft && (
                <span className="text-green-600 text-sm flex items-center">
                  <Check className="w-4 h-4 mr-1" />
                  Draft Saved
                </span>
              )}

              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={submitIdea}
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-1" />
                  {isSubmitting ? 'Submitting...' : 'Submit Idea'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};