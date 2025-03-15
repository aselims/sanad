import api from './api';
import { InnovatorType, UserRoleType } from '../constants/roles';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRoleType;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      profilePicture?: string;
      bio?: string;
      organization?: string;
      position?: string;
      isVerified: boolean;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    token: string;
  };
}

/**
 * Register a new user
 * @param data User registration data
 * @returns Promise with the registration response
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  
  // Store token and user data in local storage
  if (response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }
  
  return response.data;
};

/**
 * Login a user
 * @param data User login credentials
 * @returns Promise with the login response
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  
  // Store token and user data in local storage
  if (response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }
  
  return response.data;
};

/**
 * Get the current user's profile
 * @returns Promise with the user profile
 */
export const getCurrentUser = async (): Promise<any> => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Change the user's password
 * @param currentPassword Current password
 * @param newPassword New password
 * @returns Promise with the response
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<any> => {
  const response = await api.post('/auth/change-password', { currentPassword, newPassword });
  return response.data;
};

/**
 * Logout the current user
 */
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

/**
 * Check if the user is authenticated
 * @returns Boolean indicating if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * Get the current user from local storage
 * @returns User object or null
 */
export const getUser = (): any => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}; 