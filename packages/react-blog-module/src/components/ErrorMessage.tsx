import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  variant = 'error' 
}) => {
  const variantClasses = {
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  return (
    <div className={`border rounded-md p-4 ${variantClasses[variant]}`}>
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span className="flex-1">{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 px-3 py-1 text-sm font-medium rounded-md bg-white hover:bg-gray-50 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};