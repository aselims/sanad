import api from './api';
import { Comment } from '../types';

/**
 * Get all comments for a specific collaboration
 * @param collaborationId - The ID of the collaboration
 * @returns Promise with array of comments
 */
export const getComments = async (collaborationId: string): Promise<Comment[]> => {
  try {
    const response = await api.get(`/comments/${collaborationId}`);
    if (response.data) {
      return response.data;
    }
    
    console.error('API response for comments is not in the expected format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching comments from API:', error);
    
    // Fallback to local storage in case API fails
    try {
      console.log('Falling back to local storage for comments...');
      const storedComments = localStorage.getItem(`comments_${collaborationId}`);
      if (storedComments) {
        const parsedComments = JSON.parse(storedComments);
        console.log('Fetched comments from local storage:', parsedComments.length);
        return parsedComments;
      }
    } catch (localStorageError) {
      console.error('Error fetching comments from local storage:', localStorageError);
    }
    
    return [];
  }
};

/**
 * Add a new comment
 * @param comment - The comment data to add
 * @returns Promise with the added comment
 */
export const addComment = async (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes'>): Promise<Comment> => {
  try {
    const response = await api.post('/comments', comment);
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to add comment: Invalid response from API');
  } catch (error) {
    console.error('Error adding comment via API:', error);
    
    // Fallback to local storage
    try {
      const newComment: Comment = {
        ...comment,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        upvotes: 0,
        downvotes: 0
      };
      
      const storedComments = localStorage.getItem(`comments_${comment.collaborationId}`) || '[]';
      const comments = JSON.parse(storedComments);
      comments.push(newComment);
      localStorage.setItem(`comments_${comment.collaborationId}`, JSON.stringify(comments));
      
      return newComment;
    } catch (localStorageError) {
      console.error('Error saving comment to local storage:', localStorageError);
      throw error;
    }
  }
};

/**
 * Update an existing comment
 * @param id - The ID of the comment to update
 * @param data - The updated comment data
 * @returns Promise with the updated comment
 */
export const updateComment = async (id: string, data: Partial<Comment>): Promise<Comment> => {
  try {
    const response = await api.put(`/comments/${id}`, data);
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to update comment: Invalid response from API');
  } catch (error) {
    console.error('Error updating comment via API:', error);
    
    // Fallback to local storage
    try {
      const collaborationId = data.collaborationId;
      if (!collaborationId) {
        throw new Error('Collaboration ID is required for local storage fallback');
      }
      
      const storedComments = localStorage.getItem(`comments_${collaborationId}`) || '[]';
      const comments = JSON.parse(storedComments);
      const commentIndex = comments.findIndex((c: Comment) => c.id === id);
      
      if (commentIndex !== -1) {
        comments[commentIndex] = { ...comments[commentIndex], ...data, updatedAt: new Date() };
        localStorage.setItem(`comments_${collaborationId}`, JSON.stringify(comments));
        return comments[commentIndex];
      }
      
      throw new Error('Comment not found in local storage');
    } catch (localStorageError) {
      console.error('Error updating comment in local storage:', localStorageError);
      throw error;
    }
  }
};

/**
 * Delete a comment
 * @param id - The ID of the comment to delete
 * @param collaborationId - The ID of the parent collaboration
 * @returns Promise indicating success
 */
export const deleteComment = async (id: string, collaborationId: string): Promise<void> => {
  try {
    await api.delete(`/comments/${id}`);
  } catch (error) {
    console.error('Error deleting comment via API:', error);
    
    // Fallback to local storage
    try {
      const storedComments = localStorage.getItem(`comments_${collaborationId}`) || '[]';
      const comments = JSON.parse(storedComments);
      const filteredComments = comments.filter((c: Comment) => c.id !== id);
      localStorage.setItem(`comments_${collaborationId}`, JSON.stringify(filteredComments));
    } catch (localStorageError) {
      console.error('Error deleting comment from local storage:', localStorageError);
      throw error;
    }
  }
};

/**
 * Vote on a comment (upvote or downvote)
 * @param id - The ID of the comment
 * @param voteType - The type of vote ('up' or 'down')
 * @param collaborationId - The ID of the parent collaboration (for local storage fallback)
 * @returns Promise with the updated comment
 */
export const voteComment = async (id: string, voteType: 'up' | 'down', collaborationId: string): Promise<Comment> => {
  try {
    const response = await api.post(`/comments/${id}/vote`, { voteType });
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to vote on comment: Invalid response from API');
  } catch (error) {
    console.error('Error voting on comment via API:', error);
    
    // Fallback to local storage
    try {
      const storedComments = localStorage.getItem(`comments_${collaborationId}`) || '[]';
      const comments = JSON.parse(storedComments);
      const commentIndex = comments.findIndex((c: Comment) => c.id === id);
      
      if (commentIndex !== -1) {
        const comment = comments[commentIndex];
        const previousVote = comment.userVote;
        
        // Adjust vote counts based on previous vote
        if (previousVote === voteType) {
          // Cancel existing vote
          comment.userVote = null;
          comment[`${voteType}votes`] -= 1;
        } else {
          // Change vote or add new vote
          if (previousVote) {
            // Undo previous vote
            comment[`${previousVote}votes`] -= 1;
          }
          
          // Add new vote
          comment.userVote = voteType;
          comment[`${voteType}votes`] += 1;
        }
        
        comment.updatedAt = new Date();
        comments[commentIndex] = comment;
        localStorage.setItem(`comments_${collaborationId}`, JSON.stringify(comments));
        return comment;
      }
      
      throw new Error('Comment not found in local storage');
    } catch (localStorageError) {
      console.error('Error updating comment vote in local storage:', localStorageError);
      throw error;
    }
  }
}; 