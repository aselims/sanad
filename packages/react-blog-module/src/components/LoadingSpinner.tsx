import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'border-indigo-500' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex justify-center items-center h-64">
      <div 
        className={`animate-spin rounded-full border-t-2 border-b-2 ${color} ${sizeClasses[size]}`}
      />
    </div>
  );
};