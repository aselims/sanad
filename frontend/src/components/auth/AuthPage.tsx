import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  onSuccess?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login');
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('User is authenticated, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLoginSuccess = () => {
    console.log('Login successful, navigating to home');
    navigate('/', { replace: true });
  };

  // Don't render the auth page while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-indigo-600">Collopi</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Innovation Collaboration Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {activeForm === 'login' ? (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onRegisterClick={() => setActiveForm('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={handleLoginSuccess}
            onLoginClick={() => setActiveForm('login')}
          />
        )}
        
        <div className="mt-6 text-center">
          <button 
            onClick={onSuccess || (() => navigate('/'))}
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 