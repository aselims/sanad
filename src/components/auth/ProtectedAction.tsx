import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthRequiredModal from './AuthRequiredModal';

interface ProtectedActionProps {
  children: React.ReactNode;
  onAction: () => void;
  buttonClassName?: string;
  redirectPath?: string;
  actionName?: string;
}

/**
 * A component that wraps actions that require authentication.
 * If the user is not authenticated, it shows a modal asking them to log in.
 * If the user is authenticated, the action will be executed.
 */
const ProtectedAction: React.FC<ProtectedActionProps> = ({
  children,
  onAction,
  buttonClassName,
  redirectPath = '/auth',
  actionName = 'perform this action',
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isAuthenticated) {
      // User is authenticated, execute the action
      onAction();
    } else {
      // User is not authenticated, show the auth modal
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <button 
        className={buttonClassName} 
        onClick={handleClick}
      >
        {children}
      </button>

      <AuthRequiredModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionName={actionName}
      />
    </>
  );
};

export default ProtectedAction; 