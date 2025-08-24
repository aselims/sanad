import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, PlusCircle, Edit2, Calendar } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress?: number;
}

interface MilestonesSectionProps {
  milestones: Milestone[];
  isOwner: boolean;
  onAddMilestone?: (milestone: Partial<Milestone>) => void;
  onUpdateMilestone?: (id: string, updates: Partial<Milestone>) => void;
}

export function MilestonesSection({
  milestones = [],
  isOwner,
  onAddMilestone,
  onUpdateMilestone,
}: MilestonesSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  const handleAddMilestone = () => {
    if (newMilestone.title && onAddMilestone) {
      onAddMilestone({
        ...newMilestone,
        status: 'pending',
        progress: 0,
      });
      setNewMilestone({ title: '', description: '', dueDate: '' });
      setShowAddForm(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-5 w-5 text-green-500' />;
      case 'in_progress':
        return <Clock className='h-5 w-5 text-yellow-500' />;
      default:
        return <AlertCircle className='h-5 w-5 text-gray-400' />;
    }
  };

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const progressPercentage =
    milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-xl font-bold text-gray-900'>Milestones</h2>
          <p className='text-sm text-gray-500 mt-1'>
            {completedCount} of {milestones.length} completed
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowAddForm(true)}
            className='flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors'
          >
            <PlusCircle className='h-4 w-4' />
            Add Milestone
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className='mb-6'>
        <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
          <div
            className='h-full bg-indigo-600 rounded-full transition-all duration-500'
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className='text-sm text-gray-500 mt-2'>{progressPercentage}% Complete</p>
      </div>

      {/* Add Milestone Form */}
      {showAddForm && (
        <div className='mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-3'>Add New Milestone</h3>
          <div className='space-y-3'>
            <input
              type='text'
              placeholder='Milestone title'
              value={newMilestone.title}
              onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
            />
            <textarea
              placeholder='Description (optional)'
              value={newMilestone.description}
              onChange={e => setNewMilestone({ ...newMilestone, description: e.target.value })}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
              rows={2}
            />
            <input
              type='date'
              value={newMilestone.dueDate}
              onChange={e => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
            />
            <div className='flex gap-2'>
              <button
                onClick={handleAddMilestone}
                className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700'
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewMilestone({ title: '', description: '', dueDate: '' });
                }}
                className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestones List */}
      <div className='space-y-3'>
        {milestones.length === 0 ? (
          <p className='text-gray-500 text-center py-8'>No milestones added yet</p>
        ) : (
          milestones.map(milestone => (
            <div
              key={milestone.id}
              className='flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors'
            >
              {getStatusIcon(milestone.status)}
              <div className='flex-1'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h4 className='font-medium text-gray-900'>{milestone.title}</h4>
                    {milestone.description && (
                      <p className='text-sm text-gray-500 mt-1'>{milestone.description}</p>
                    )}
                    {milestone.dueDate && (
                      <div className='flex items-center gap-1 mt-2 text-xs text-gray-500'>
                        <Calendar className='h-3 w-3' />
                        {new Date(milestone.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => setEditingId(milestone.id)}
                      className='p-1 hover:bg-gray-200 rounded'
                    >
                      <Edit2 className='h-4 w-4 text-gray-500' />
                    </button>
                  )}
                </div>
                {milestone.progress !== undefined && (
                  <div className='mt-2'>
                    <div className='h-1 bg-gray-200 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-indigo-600 rounded-full'
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
