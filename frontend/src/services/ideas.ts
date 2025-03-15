import api from './api';
import { Collaboration } from '../types';

// Helper function to convert idea data from the API to the Collaboration format
const formatIdea = (idea: any): Collaboration => {
  return {
    id: idea.id,
    title: idea.title,
    participants: idea.participants || [],
    status: idea.status,
    description: idea.description,
    type: 'idea',
    ideaDetails: {
      category: idea.category || '',
      stage: idea.stage || 'concept',
      targetAudience: idea.targetAudience || '',
      potentialImpact: idea.potentialImpact || '',
      resourcesNeeded: idea.resourcesNeeded || '',
    },
    createdById: idea.createdById,
    createdAt: new Date(idea.createdAt),
    updatedAt: new Date(idea.updatedAt),
  };
};

/**
 * Get all ideas from the backend
 * @returns Promise with all ideas converted to Collaboration format
 */
export const getAllIdeas = async (): Promise<Collaboration[]> => {
  try {
    // Attempt to fetch ideas from the backend API
    const response = await api.get('/ideas');
    
    // Check if response.data exists and is an array before mapping
    if (response.data && Array.isArray(response.data)) {
      console.log('Fetched ideas from API:', response.data.length);
      
      // Convert the API response to Collaboration format
      const ideas = response.data.map((idea: any) => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        participants: idea.participants || [],
        status: idea.status || 'proposed',
        type: 'idea' as 'idea',
        createdAt: new Date(idea.createdAt),
        updatedAt: new Date(idea.updatedAt),
        ideaDetails: {
          category: idea.category,
          stage: idea.stage,
          targetAudience: idea.targetAudience,
          potentialImpact: idea.potentialImpact,
          resourcesNeeded: idea.resourcesNeeded,
          creatorName: idea.creatorName,
          creatorEmail: idea.creatorEmail,
        }
      }));
      
      return ideas;
    } else {
      console.warn('API response for ideas is not in the expected format:', response.data);
      // If response.data is not an array, fall back to local storage
      throw new Error('API response is not in the expected format');
    }
  } catch (error) {
    console.error('Error fetching ideas from API:', error);
    
    // Fallback to local storage if API fails
    try {
      console.log('Falling back to local storage for ideas...');
      const storedIdeas = localStorage.getItem('ideas');
      if (storedIdeas) {
        const parsedIdeas = JSON.parse(storedIdeas);
        console.log('Fetched ideas from local storage:', parsedIdeas.length);
        return parsedIdeas;
      }
    } catch (localStorageError) {
      console.error('Error fetching ideas from local storage:', localStorageError);
    }
    
    // Return empty array if both API and local storage fail
    return [];
  }
};

/**
 * Get a single idea by ID
 * @param id Idea ID
 * @returns Promise with the idea or null if not found
 */
export const getIdeaById = async (id: string): Promise<Collaboration | null> => {
  try {
    // Attempt to fetch the idea from the backend API
    const response = await api.get(`/ideas/${id}`);
    const idea = response.data;
    
    // Convert to Collaboration format
    return {
      id: idea.id,
      title: idea.title,
      description: idea.description,
      participants: idea.participants || [],
      status: idea.status || 'proposed',
      type: 'idea',
      createdAt: new Date(idea.createdAt),
      updatedAt: new Date(idea.updatedAt),
      ideaDetails: {
        category: idea.category,
        stage: idea.stage,
        targetAudience: idea.targetAudience,
        potentialImpact: idea.potentialImpact,
        resourcesNeeded: idea.resourcesNeeded,
        creatorName: idea.creatorName,
        creatorEmail: idea.creatorEmail,
      }
    };
  } catch (error) {
    console.error(`Error fetching idea with ID ${id}:`, error);
    
    // Fallback to local storage if API fails
    try {
      console.log(`Falling back to local storage for idea ${id}...`);
      const storedIdeas = localStorage.getItem('ideas');
      if (storedIdeas) {
        const parsedIdeas = JSON.parse(storedIdeas);
        const idea = parsedIdeas.find((i: Collaboration) => i.id === id);
        if (idea) {
          return idea;
        }
      }
    } catch (localStorageError) {
      console.error(`Error fetching idea ${id} from local storage:`, localStorageError);
    }
    
    return null;
  }
};

/**
 * Create a new idea
 * @param idea Idea data
 * @returns Promise with the created idea
 */
export const createIdea = async (ideaData: Partial<Collaboration>): Promise<Collaboration | null> => {
  try {
    // Prepare the data for the API
    const apiData = {
      title: ideaData.title,
      description: ideaData.description,
      category: ideaData.ideaDetails?.category,
      stage: ideaData.ideaDetails?.stage,
      targetAudience: ideaData.ideaDetails?.targetAudience,
      potentialImpact: ideaData.ideaDetails?.potentialImpact,
      resourcesNeeded: ideaData.ideaDetails?.resourcesNeeded,
      status: ideaData.status || 'proposed',
      participants: ideaData.participants || [],
    };
    
    // Send the data to the API
    const response = await api.post('/ideas', apiData);
    const createdIdea = response.data.idea;
    
    // Convert to Collaboration format
    const formattedIdea: Collaboration = {
      id: createdIdea.id,
      title: createdIdea.title,
      description: createdIdea.description,
      participants: createdIdea.participants || [],
      status: createdIdea.status || 'proposed',
      type: 'idea',
      createdAt: new Date(createdIdea.createdAt),
      updatedAt: new Date(createdIdea.updatedAt),
      ideaDetails: {
        category: createdIdea.category,
        stage: createdIdea.stage,
        targetAudience: createdIdea.targetAudience,
        potentialImpact: createdIdea.potentialImpact,
        resourcesNeeded: createdIdea.resourcesNeeded,
        creatorName: createdIdea.creatorName,
        creatorEmail: createdIdea.creatorEmail,
      }
    };
    
    // Also store in local storage as a fallback
    try {
      const storedIdeas = localStorage.getItem('ideas');
      const ideas = storedIdeas ? JSON.parse(storedIdeas) : [];
      ideas.push(formattedIdea);
      localStorage.setItem('ideas', JSON.stringify(ideas));
    } catch (localStorageError) {
      console.error('Error storing idea in local storage:', localStorageError);
    }
    
    return formattedIdea;
  } catch (error) {
    console.error('Error creating idea:', error);
    return null;
  }
};

/**
 * Get ideas from local storage
 * @returns Array of ideas stored locally
 */
export const getLocalIdeas = (): Collaboration[] => {
  try {
    const ideasJson = localStorage.getItem('ideas');
    if (!ideasJson) return [];
    
    const ideas = JSON.parse(ideasJson) as Collaboration[];
    console.log('Fetched ideas from local storage:', ideas.length);
    return ideas;
  } catch (error) {
    console.error('Error fetching ideas from local storage:', error);
    return [];
  }
};

/**
 * Save an idea to both backend and local storage
 * @param idea The idea to save
 * @returns Promise with the saved idea
 */
export const saveIdea = async (idea: Collaboration): Promise<Collaboration> => {
  try {
    // First try to save to the backend
    const response = await api.post('/ideas', idea);
    const savedIdea = formatIdea(response.data.data);
    
    // If backend save is successful, we don't need to save to local storage
    console.log('Saved idea to backend:', savedIdea.title);
    return savedIdea;
  } catch (error) {
    console.error('Error saving idea to backend:', error);
    
    // Fallback to local storage if backend request fails
    try {
      const existingIdeas = getLocalIdeas();
      const updatedIdeas = [...existingIdeas, idea];
      localStorage.setItem('ideas', JSON.stringify(updatedIdeas));
      console.log('Saved idea to local storage as fallback:', idea.title);
      return idea;
    } catch (localError) {
      console.error('Error saving idea to local storage:', localError);
      throw new Error('Failed to save idea');
    }
  }
};

/**
 * Update an idea
 * @param id Idea ID
 * @param data Idea data to update
 * @returns Promise with the updated idea
 */
export const updateIdea = async (id: string, data: Partial<Collaboration>): Promise<Collaboration> => {
  try {
    // First try to update in the backend
    const response = await api.put(`/ideas/${id}`, data);
    const updatedIdea = formatIdea(response.data.data);
    
    // If backend update is successful, we don't need to update local storage
    console.log('Updated idea in backend:', updatedIdea.title);
    return updatedIdea;
  } catch (error) {
    console.error(`Error updating idea ${id} in backend:`, error);
    
    // Fallback to local storage
    try {
      const localIdeas = getLocalIdeas();
      const ideaIndex = localIdeas.findIndex(i => i.id === id);
      
      if (ideaIndex === -1) {
        throw new Error('Idea not found in local storage');
      }
      
      const updatedIdea = { ...localIdeas[ideaIndex], ...data };
      localIdeas[ideaIndex] = updatedIdea;
      
      localStorage.setItem('ideas', JSON.stringify(localIdeas));
      console.log('Updated idea in local storage as fallback:', updatedIdea.title);
      return updatedIdea;
    } catch (localError) {
      console.error(`Error updating idea ${id} in local storage:`, localError);
      throw new Error('Failed to update idea');
    }
  }
};

/**
 * Delete an idea
 * @param id Idea ID
 * @returns Promise with the deletion response
 */
export const deleteIdea = async (id: string): Promise<any> => {
  try {
    // First try to delete from the backend
    const response = await api.delete(`/ideas/${id}`);
    console.log(`Deleted idea ${id} from backend`);
    
    // Also remove from local storage if it exists there
    try {
      const localIdeas = getLocalIdeas();
      const filteredIdeas = localIdeas.filter(i => i.id !== id);
      localStorage.setItem('ideas', JSON.stringify(filteredIdeas));
    } catch (localError) {
      console.error(`Error removing idea ${id} from local storage:`, localError);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error deleting idea ${id} from backend:`, error);
    
    // Fallback to just removing from local storage
    try {
      const localIdeas = getLocalIdeas();
      const filteredIdeas = localIdeas.filter(i => i.id !== id);
      localStorage.setItem('ideas', JSON.stringify(filteredIdeas));
      console.log(`Removed idea ${id} from local storage as fallback`);
      return { success: true, message: 'Idea removed from local storage' };
    } catch (localError) {
      console.error(`Error removing idea ${id} from local storage:`, localError);
      throw new Error('Failed to delete idea');
    }
  }
}; 