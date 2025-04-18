import axios from 'axios';

// Determine the API URL based on environment
const API_URL = import.meta.env.DEV 
  ? import.meta.env.VITE_API_URL || '/api'  // Use VITE_API_URL directly if available, otherwise use '/api'
  : '/api';  // Use relative path for production, will be handled by nginx proxy

// Ensure API_URL has /api at the end if it doesn't already
const baseURL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

// Create an axios instance with default config
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in cross-origin requests
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;

// Upload a file to a collaboration
export const uploadFile = async (collaborationId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return await api.post(`/collaborations/${collaborationId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Get files for a collaboration
export const getCollaborationFiles = async (collaborationId: string) => {
  return await api.get(`/collaborations/${collaborationId}/files`);
};

// Delete a file
export const deleteFile = async (fileId: string) => {
  return await api.delete(`/files/${fileId}`);
};

// Get file download URL
export const getFileDownloadUrl = (fileId: string) => {
  return `${api.defaults.baseURL}/files/${fileId}`;
};

/**
 * Send a message to another user
 * @param receiverId ID of the message recipient
 * @param content Message content
 * @returns Response data
 */
export const sendMessage = async (receiverId: string, content: string) => {
  const response = await api.post('/messages', {
    recipientId: receiverId,
    content
  });
  return response.data;
};

/**
 * Submit interest in a collaboration/opportunity
 * @param data Interest submission data
 * @returns Response data
 */
export const submitInterest = async (data: {
  entityId: string;
  entityType: string;
  entityTitle: string;
  ownerId: string;
  message: string;
  additionalInfo?: string;
}) => {
  const response = await api.post('/interest/submit', data);
  return response.data;
}; 