import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Award, Eye, EyeOff, Star, ExternalLink } from 'lucide-react';
import {
  UserSkill,
  CreateUserSkillDto,
  UpdateUserSkillDto,
  PROFICIENCY_LEVELS,
  COMMON_SKILLS,
  PortfolioItem
} from '../types/user';
import {
  getMySkills,
  createSkill,
  updateSkill,
  deleteSkill,
  endorseSkill,
  removeEndorsement,
  getSkillLevelColor,
  getSkillLevelBadge,
  groupSkillsByCategory,
  calculateSkillStrength,
  validateSkill
} from '../services/skills';

interface SkillsManagementProps {
  userId?: string;
  canEdit?: boolean;
  canEndorse?: boolean;
  showAddButton?: boolean;
}

interface SkillFormData {
  skillName: string;
  proficiencyLevel: number;
  yearsExperience: number;
  certifications: string[];
  portfolioItems: PortfolioItem[];
  isHighlighted: boolean;
}

const SkillsManagement: React.FC<SkillsManagementProps> = ({
  userId,
  canEdit = true,
  canEndorse = false,
  showAddButton = true
}) => {
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<UserSkill | null>(null);
  const [formData, setFormData] = useState<SkillFormData>({
    skillName: '',
    proficiencyLevel: 3,
    yearsExperience: 0,
    certifications: [],
    portfolioItems: [],
    isHighlighted: false
  });

  // Form state
  const [newCertification, setNewCertification] = useState('');
  const [newPortfolioItem, setNewPortfolioItem] = useState<PortfolioItem>({
    title: '',
    description: '',
    url: '',
    technologies: [],
    screenshots: []
  });
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadSkills();
  }, [userId]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const skillsData = await getMySkills(canEdit);
      setSkills(skillsData);
    } catch (error) {
      console.error('Error loading skills:', error);
      setError('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (skill?: UserSkill) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData({
        skillName: skill.skillName,
        proficiencyLevel: skill.proficiencyLevel,
        yearsExperience: skill.yearsExperience,
        certifications: skill.certifications || [],
        portfolioItems: skill.portfolioItems || [],
        isHighlighted: skill.isHighlighted
      });
    } else {
      setEditingSkill(null);
      setFormData({
        skillName: '',
        proficiencyLevel: 3,
        yearsExperience: 0,
        certifications: [],
        portfolioItems: [],
        isHighlighted: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSkill(null);
    setShowPortfolioForm(false);
    setNewCertification('');
    setNewPortfolioItem({
      title: '',
      description: '',
      url: '',
      technologies: [],
      screenshots: []
    });
    setShowSuggestions(false);
    setSkillSuggestions([]);
  };

  const handleSkillNameChange = (value: string) => {
    setFormData({ ...formData, skillName: value });
    
    if (value.length > 1) {
      const suggestions = COMMON_SKILLS.filter(skill =>
        skill.toLowerCase().includes(value.toLowerCase()) &&
        skill.toLowerCase() !== value.toLowerCase()
      ).slice(0, 5);
      setSkillSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const skillData: CreateUserSkillDto = {
        skillName: formData.skillName.trim(),
        proficiencyLevel: formData.proficiencyLevel,
        yearsExperience: formData.yearsExperience,
        certifications: formData.certifications,
        portfolioItems: formData.portfolioItems,
        isHighlighted: formData.isHighlighted
      };

      const validationErrors = validateSkill(skillData);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return;
      }

      if (editingSkill) {
        await updateSkill(editingSkill.id, skillData as UpdateUserSkillDto);
      } else {
        await createSkill(skillData);
      }

      await loadSkills();
      handleCloseModal();
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to save skill');
    }
  };

  const handleDelete = async (skillId: string) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    try {
      await deleteSkill(skillId);
      await loadSkills();
    } catch (error: any) {
      setError(error.message || 'Failed to delete skill');
    }
  };

  const handleEndorse = async (skillId: string) => {
    try {
      await endorseSkill(skillId);
      await loadSkills();
    } catch (error: any) {
      setError(error.message || 'Failed to endorse skill');
    }
  };

  const toggleSkillVisibility = async (skill: UserSkill) => {
    try {
      await updateSkill(skill.id, { isVisible: !skill.isVisible });
      await loadSkills();
    } catch (error: any) {
      setError(error.message || 'Failed to update skill visibility');
    }
  };

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification.trim()]
      });
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    const newCertifications = formData.certifications.filter((_, i) => i !== index);
    setFormData({ ...formData, certifications: newCertifications });
  };

  const addPortfolioItem = () => {
    if (newPortfolioItem.title.trim() && newPortfolioItem.description.trim()) {
      setFormData({
        ...formData,
        portfolioItems: [...formData.portfolioItems, { ...newPortfolioItem }]
      });
      setNewPortfolioItem({
        title: '',
        description: '',
        url: '',
        technologies: [],
        screenshots: []
      });
      setShowPortfolioForm(false);
    }
  };

  const removePortfolioItem = (index: number) => {
    const newItems = formData.portfolioItems.filter((_, i) => i !== index);
    setFormData({ ...formData, portfolioItems: newItems });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedSkills = groupSkillsByCategory(skills);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
          <p className="text-gray-600">Showcase your skills and get endorsements from your network</p>
        </div>
        {canEdit && showAddButton && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
        )}
      </div>

      {Object.keys(groupedSkills).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-500 mb-4">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <p>No skills added yet</p>
          </div>
          {canEdit && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Add Your First Skill
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      skill.isHighlighted ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                    } ${!skill.isVisible ? 'opacity-60' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        {skill.skillName}
                        {skill.isHighlighted && <Star className="w-4 h-4 text-yellow-500" />}
                        {!skill.isVisible && <EyeOff className="w-4 h-4 text-gray-400" />}
                      </h4>
                      {canEdit && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleSkillVisibility(skill)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title={skill.isVisible ? 'Hide skill' : 'Show skill'}
                          >
                            {skill.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleOpenModal(skill)}
                            className="text-gray-400 hover:text-blue-600 p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(skill.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.proficiencyLevel)}`}>
                          {PROFICIENCY_LEVELS.find(level => level.value === skill.proficiencyLevel)?.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getSkillLevelBadge(skill.proficiencyLevel)}
                        </span>
                      </div>

                      {skill.yearsExperience > 0 && (
                        <div className="text-sm text-gray-600">
                          {skill.yearsExperience} year{skill.yearsExperience !== 1 ? 's' : ''} experience
                        </div>
                      )}

                      {skill.endorsedBy && skill.endorsedBy.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Award className="w-4 h-4" />
                          {skill.endorsedBy.length} endorsement{skill.endorsedBy.length !== 1 ? 's' : ''}
                        </div>
                      )}

                      {skill.certifications && skill.certifications.length > 0 && (
                        <div className="text-sm text-gray-600">
                          {skill.certifications.length} certification{skill.certifications.length !== 1 ? 's' : ''}
                        </div>
                      )}

                      {skill.portfolioItems && skill.portfolioItems.length > 0 && (
                        <div className="text-sm text-gray-600">
                          {skill.portfolioItems.length} portfolio item{skill.portfolioItems.length !== 1 ? 's' : ''}
                        </div>
                      )}

                      <div className="mt-2 bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full"
                          style={{ width: `${(calculateSkillStrength(skill) / 200) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {canEndorse && (
                      <div className="mt-3 pt-3 border-t">
                        <button
                          onClick={() => handleEndorse(skill.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Endorse
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Skill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">
                {editingSkill ? 'Edit Skill' : 'Add New Skill'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Skill Name with Suggestions */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Name *
                </label>
                <input
                  type="text"
                  value={formData.skillName}
                  onChange={(e) => handleSkillNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., React, Python, Project Management"
                  required
                />
                {showSuggestions && skillSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                    {skillSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, skillName: suggestion });
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Proficiency Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proficiency Level *
                </label>
                <select
                  value={formData.proficiencyLevel}
                  onChange={(e) => setFormData({ ...formData, proficiencyLevel: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {PROFICIENCY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label} - {level.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Highlight Skill */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isHighlighted"
                  checked={formData.isHighlighted}
                  onChange={(e) => setFormData({ ...formData, isHighlighted: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isHighlighted" className="text-sm text-gray-700">
                  Highlight this skill on your profile
                </label>
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications
                </label>
                <div className="space-y-2">
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="text-sm">{cert}</span>
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="Add certification..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                    />
                    <button
                      type="button"
                      onClick={addCertification}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Portfolio Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Items
                </label>
                <div className="space-y-2">
                  {formData.portfolioItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded border">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-gray-600">{item.description}</p>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                            >
                              View Project <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePortfolioItem(index)}
                          className="text-red-600 hover:text-red-700 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {!showPortfolioForm ? (
                    <button
                      type="button"
                      onClick={() => setShowPortfolioForm(true)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Portfolio Item
                    </button>
                  ) : (
                    <div className="border rounded p-3 space-y-2">
                      <input
                        type="text"
                        value={newPortfolioItem.title}
                        onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, title: e.target.value })}
                        placeholder="Project title"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <textarea
                        value={newPortfolioItem.description}
                        onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, description: e.target.value })}
                        placeholder="Project description"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        rows={2}
                      />
                      <input
                        type="url"
                        value={newPortfolioItem.url}
                        onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, url: e.target.value })}
                        placeholder="Project URL (optional)"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={addPortfolioItem}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPortfolioForm(false)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                >
                  {editingSkill ? 'Update Skill' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsManagement;
