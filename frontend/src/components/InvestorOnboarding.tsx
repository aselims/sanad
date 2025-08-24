import React, { useState } from 'react';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  DollarSign,
  Target,
  Users,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Plus,
  X
} from 'lucide-react';
import {
  createInvestor,
  type CreateInvestorData
} from '../services/investors';

interface InvestorOnboardingProps {
  onComplete: () => void;
  onCancel: () => void;
}

const InvestorOnboarding: React.FC<InvestorOnboardingProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateInvestorData>({
    investorType: 'angel',
    firmName: '',
    contactEmail: '',
    minInvestment: 0,
    maxInvestment: 0,
    focusAreas: [],
    stagePreference: [],
    geographicFocus: [],
    industries: [],
    businessModels: [],
    notableExits: [],
    availabilityHours: [],
    requiredDocuments: [],
  });

  const steps = [
    { number: 1, title: 'Basic Information', icon: Building },
    { number: 2, title: 'Investment Criteria', icon: DollarSign },
    { number: 3, title: 'Focus & Preferences', icon: Target },
    { number: 4, title: 'Portfolio & Experience', icon: Users },
    { number: 5, title: 'Review & Submit', icon: CheckCircle },
  ];

  // Form options
  const investorTypes = [
    { value: 'angel', label: 'Angel Investor', description: 'Individual investor' },
    { value: 'vc', label: 'Venture Capital', description: 'Professional VC firm' },
    { value: 'corporate', label: 'Corporate Venture', description: 'Corporate investment arm' },
    { value: 'family_office', label: 'Family Office', description: 'Private wealth management' }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SAR', 'AED'];
  
  const focusAreaOptions = [
    'Technology', 'Healthcare', 'FinTech', 'EdTech', 'CleanTech', 
    'Consumer', 'Enterprise', 'AI/ML', 'Blockchain', 'IoT', 
    'Cybersecurity', 'Biotech', 'E-commerce', 'SaaS', 'Hardware',
    'Mobile Apps', 'Gaming', 'Media', 'Real Estate', 'Food & Beverage'
  ];

  const stageOptions = [
    { value: 'pre_seed', label: 'Pre-Seed' },
    { value: 'seed', label: 'Seed' },
    { value: 'series_a', label: 'Series A' },
    { value: 'series_b', label: 'Series B' },
    { value: 'series_c', label: 'Series C' },
    { value: 'growth', label: 'Growth' },
    { value: 'late_stage', label: 'Late Stage' }
  ];

  const industryOptions = [
    'Aerospace', 'Agriculture', 'Automotive', 'Banking', 'Biotechnology',
    'Construction', 'Consumer Goods', 'Education', 'Energy', 'Entertainment',
    'Fashion', 'Finance', 'Food', 'Government', 'Healthcare', 'Hospitality',
    'Insurance', 'Legal', 'Manufacturing', 'Media', 'Non-profit',
    'Pharmaceuticals', 'Real Estate', 'Retail', 'Technology', 'Transportation'
  ];

  const businessModelOptions = [
    'B2B SaaS', 'B2C Subscription', 'Marketplace', 'E-commerce', 
    'Advertising', 'Freemium', 'Enterprise Software', 'Mobile Apps',
    'Hardware', 'Platform', 'On-demand', 'Licensing'
  ];

  const handleInputChange = (field: keyof CreateInvestorData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleArrayAdd = (field: keyof CreateInvestorData, value: string) => {
    if (!value.trim()) return;
    const currentArray = formData[field] as string[] || [];
    if (!currentArray.includes(value)) {
      handleInputChange(field, [...currentArray, value]);
    }
  };

  const handleArrayRemove = (field: keyof CreateInvestorData, value: string) => {
    const currentArray = formData[field] as string[] || [];
    handleInputChange(field, currentArray.filter(item => item !== value));
  };

  const handleMultiSelect = (field: keyof CreateInvestorData, value: string) => {
    const currentArray = formData[field] as string[] || [];
    if (currentArray.includes(value)) {
      handleArrayRemove(field, value);
    } else {
      handleArrayAdd(field, value);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firmName && formData.contactEmail && formData.investorType);
      case 2:
        return !!(formData.minInvestment > 0 && formData.maxInvestment >= formData.minInvestment);
      case 3:
        return formData.focusAreas.length > 0 && formData.stagePreference.length > 0;
      case 4:
        return true; // Optional step
      case 5:
        return true; // Review step
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await createInvestor(formData);
      onComplete();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create investor profile');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
              <p className="text-gray-600">Tell us about your firm and how to reach you</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Investor Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {investorTypes.map(type => (
                  <div
                    key={type.value}
                    onClick={() => handleInputChange('investorType', type.value)}
                    className={`p-4 border rounded-lg cursor-pointer hover:border-blue-300 ${
                      formData.investorType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firm Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firmName}
                onChange={(e) => handleInputChange('firmName', e.target.value)}
                placeholder="e.g., Acme Ventures"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="contact@acmeventures.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone || ''}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contactPerson || ''}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                placeholder="John Doe, Managing Partner"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="United States"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="San Francisco"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://acmeventures.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                placeholder="Brief description of your investment firm and approach..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <DollarSign className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Investment Criteria</h2>
              <p className="text-gray-600">Define your investment parameters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.currency || 'USD'}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Investment <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.minInvestment}
                  onChange={(e) => handleInputChange('minInvestment', parseInt(e.target.value) || 0)}
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Investment <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxInvestment}
                  onChange={(e) => handleInputChange('maxInvestment', parseInt(e.target.value) || 0)}
                  placeholder="1000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Ticket Size
                </label>
                <input
                  type="number"
                  value={formData.averageTicketSize || ''}
                  onChange={(e) => handleInputChange('averageTicketSize', parseInt(e.target.value) || 0)}
                  placeholder="100000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time to Decision (weeks)
                </label>
                <input
                  type="number"
                  value={formData.timeToDecisionWeeks || ''}
                  onChange={(e) => handleInputChange('timeToDecisionWeeks', parseInt(e.target.value))}
                  placeholder="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Philosophy
              </label>
              <textarea
                value={formData.investmentPhilosophy || ''}
                onChange={(e) => handleInputChange('investmentPhilosophy', e.target.value)}
                rows={3}
                placeholder="Describe your investment philosophy and approach..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.investmentCommittee || false}
                    onChange={(e) => handleInputChange('investmentCommittee', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Investment Committee</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.boardSeatRequired || false}
                    onChange={(e) => handleInputChange('boardSeatRequired', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Board Seat Required</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Focus & Preferences</h2>
              <p className="text-gray-600">Define what you're looking for</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Focus Areas <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {focusAreaOptions.map(area => (
                  <div
                    key={area}
                    onClick={() => handleMultiSelect('focusAreas', area)}
                    className={`p-2 border rounded-md cursor-pointer text-center text-sm hover:border-blue-300 ${
                      formData.focusAreas.includes(area)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    {area}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Stage Preferences <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {stageOptions.map(stage => (
                  <div
                    key={stage.value}
                    onClick={() => handleMultiSelect('stagePreference', stage.value)}
                    className={`p-3 border rounded-md cursor-pointer text-center hover:border-blue-300 ${
                      formData.stagePreference.includes(stage.value)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    {stage.label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Industries
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {industryOptions.map(industry => (
                  <div
                    key={industry}
                    onClick={() => handleMultiSelect('industries', industry)}
                    className={`p-2 border rounded-md cursor-pointer text-center text-sm hover:border-blue-300 ${
                      formData.industries.includes(industry)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    {industry}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Business Models
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {businessModelOptions.map(model => (
                  <div
                    key={model}
                    onClick={() => handleMultiSelect('businessModels', model)}
                    className={`p-2 border rounded-md cursor-pointer text-center text-sm hover:border-blue-300 ${
                      formData.businessModels.includes(model)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    {model}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geographic Focus
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g., North America, Europe"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayAdd('geographicFocus', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder*="Geographic"]') as HTMLInputElement;
                    if (input?.value) {
                      handleArrayAdd('geographicFocus', input.value);
                      input.value = '';
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.geographicFocus.map((region, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {region}
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('geographicFocus', region)}
                      className="ml-1 h-4 w-4 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio & Experience</h2>
              <p className="text-gray-600">Share your track record and experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Size
                </label>
                <input
                  type="number"
                  value={formData.portfolioSize || ''}
                  onChange={(e) => handleInputChange('portfolioSize', parseInt(e.target.value) || 0)}
                  placeholder="25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Active Investments
                </label>
                <input
                  type="number"
                  value={formData.activeInvestments || ''}
                  onChange={(e) => handleInputChange('activeInvestments', parseInt(e.target.value) || 0)}
                  placeholder="15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Invested
                </label>
                <input
                  type="number"
                  value={formData.totalInvested || ''}
                  onChange={(e) => handleInputChange('totalInvested', parseInt(e.target.value) || 0)}
                  placeholder="5000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notable Exits
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g., Company X (Acquired by Google for $500M)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayAdd('notableExits', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder*="Company X"]') as HTMLInputElement;
                    if (input?.value) {
                      handleArrayAdd('notableExits', input.value);
                      input.value = '';
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.notableExits.map((exit, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <span className="text-sm text-gray-700">{exit}</span>
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('notableExits', exit)}
                      className="h-4 w-4 text-gray-400 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Contact Method
              </label>
              <select
                value={formData.preferredContactMethod || ''}
                onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select preferred method</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="platform">Platform messaging</option>
                <option value="warm_intro">Warm introduction</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                placeholder="Any additional information..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
              <p className="text-gray-600">Please review your information before submitting</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Firm Name:</span>
                    <div className="font-medium">{formData.firmName}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <div className="font-medium">
                      {investorTypes.find(t => t.value === formData.investorType)?.label}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <div className="font-medium">{formData.contactEmail}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <div className="font-medium">
                      {[formData.city, formData.country].filter(Boolean).join(', ') || 'Not specified'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Range</h3>
                <div className="text-sm">
                  <span className="text-gray-600">Range:</span>
                  <div className="font-medium">
                    ${formData.minInvestment?.toLocaleString()} - ${formData.maxInvestment?.toLocaleString()} {formData.currency}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Focus Areas</h3>
                <div className="flex flex-wrap gap-1">
                  {formData.focusAreas.map((area, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Stage Preferences</h3>
                <div className="flex flex-wrap gap-1">
                  {formData.stagePreference.map((stage, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {stageOptions.find(s => s.value === stage)?.label || stage}
                    </span>
                  ))}
                </div>
              </div>

              {formData.portfolioSize && formData.portfolioSize > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Portfolio</h3>
                  <div className="text-sm">
                    <span className="text-gray-600">Portfolio Size:</span>
                    <div className="font-medium">{formData.portfolioSize} companies</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Investor Onboarding</h1>
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mt-8">
              <nav aria-label="Progress">
                <ol className="flex items-center">
                  {steps.map((step, index) => (
                    <li key={step.number} className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                      {index !== steps.length - 1 && (
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className={`h-0.5 w-full ${
                            currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                          }`} />
                        </div>
                      )}
                      <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                        currentStep > step.number
                          ? 'bg-blue-600'
                          : currentStep === step.number
                          ? 'border-2 border-blue-600 bg-white'
                          : 'border-2 border-gray-300 bg-white'
                      }`}>
                        {currentStep > step.number ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <step.icon className={`h-4 w-4 ${
                            currentStep === step.number ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <span className={`text-xs font-medium ${
                          currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          {renderStepContent()}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
                <CheckCircle className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorOnboarding;