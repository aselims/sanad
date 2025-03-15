import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData } from '../../services/auth';
import { INNOVATOR_TYPES, ROLE_DISPLAY_NAMES, INNOVATOR_TYPES_ARRAY } from '../../constants/roles';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onLoginClick }) => {
  const { register, error } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: INNOVATOR_TYPES.INDIVIDUAL,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(formData);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setFormError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create an Account</h2>
      
      {(formError || error) && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {formError || error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
              First Name*
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="First Name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
              Last Name*
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Last Name"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Email"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {INNOVATOR_TYPES_ARRAY.map(role => (
              <option key={role} value={role}>
                {ROLE_DISPLAY_NAMES[role]}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Password*
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Password (min. 8 characters)"
            required
            minLength={8}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
            Confirm Password*
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Confirm Password"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onLoginClick}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm; 