import React, { useState, useEffect, useRef } from 'react';
import { Send, ThumbsUp, ThumbsDown, MoreVertical, Trash2, Edit3, Reply, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Comment } from '../types';
import { getComments, addComment, deleteComment, updateComment, voteComment } from '../services/comments';
import timeAgo from '../utils/timeAgo';
import ProtectedAction from './auth/ProtectedAction';

interface CommentSectionProps {
  collaborationId: string;
  className?: string;
}

export function CommentSection({ collaborationId, className = '' }: CommentSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchComments();
  }, [collaborationId]);

  // Auto-focus input when editing or replying
  useEffect(() => {
    if (editingCommentId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingCommentId]);

  useEffect(() => {
    if (replyingToId && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replyingToId]);

  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedComments = await getComments(collaborationId);
      // Organize comments into a hierarchy
      const topLevelComments: Comment[] = [];
      const commentMap = new Map<string, Comment>();
      
      // First pass - store all comments in a map
      fetchedComments.forEach(comment => {
        commentMap.set(comment.id, {...comment, replies: []});
      });
      
      // Second pass - organize into hierarchy
      fetchedComments.forEach(comment => {
        const commentWithReplies = commentMap.get(comment.id);
        if (!commentWithReplies) return;
        
        if (comment.parentCommentId) {
          const parent = commentMap.get(comment.parentCommentId);
          if (parent && parent.replies) {
            parent.replies.push(commentWithReplies);
          }
        } else {
          topLevelComments.push(commentWithReplies);
        }
      });
      
      // Sort by newest first
      const sortedComments = topLevelComments.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setComments(sortedComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setError('You must be logged in to add a comment.');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const comment = await addComment({
        collaborationId,
        content: newComment.trim(),
        userId: user.id,
        user: user,
      });

      // Add the new comment at the top of the list
      setComments(prevComments => [
        { ...comment, replies: [] },
        ...prevComments
      ]);
      
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleEditComment = async (id: string) => {
    if (!editText.trim()) {
      cancelEdit();
      return;
    }

    try {
      const updatedComment = await updateComment(id, { content: editText.trim() });
      
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === id) {
            return { ...comment, content: updatedComment.content, updatedAt: updatedComment.updatedAt };
          }
          
          // Check for nested replies
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply.id === id 
                  ? { ...reply, content: updatedComment.content, updatedAt: updatedComment.updatedAt }
                  : reply
              )
            };
          }
          
          return comment;
        })
      );
      
      cancelEdit();
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (id: string, isReply = false, parentId?: string) => {
    try {
      await deleteComment(id, collaborationId);
      
      if (isReply && parentId) {
        // Handle deleting a reply
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment.id === parentId && comment.replies) {
              return {
                ...comment,
                replies: comment.replies.filter(reply => reply.id !== id)
              };
            }
            return comment;
          })
        );
      } else {
        // Handle deleting a top-level comment
        setComments(prevComments => prevComments.filter(comment => comment.id !== id));
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const handleVote = async (id: string, voteType: 'up' | 'down', isReply = false, parentId?: string) => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to vote on comments.');
      return;
    }

    try {
      const updatedComment = await voteComment(id, voteType, collaborationId);
      
      if (isReply && parentId) {
        // Update a reply
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment.id === parentId && comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map(reply => 
                  reply.id === id ? updatedComment : reply
                )
              };
            }
            return comment;
          })
        );
      } else {
        // Update a top-level comment
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === id ? updatedComment : comment
          )
        );
      }
    } catch (err) {
      console.error('Error voting on comment:', err);
      setError('Failed to register vote. Please try again.');
    }
  };

  const handleReply = async (parentId: string) => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to reply to a comment.');
      return;
    }

    if (!replyText.trim()) {
      cancelReply();
      return;
    }

    try {
      const reply = await addComment({
        collaborationId,
        content: replyText.trim(),
        userId: user.id,
        user: user,
        parentCommentId: parentId
      });

      // Add the reply to the parent comment
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [reply, ...(comment.replies || [])]
            };
          }
          return comment;
        })
      );
      
      cancelReply();
    } catch (err) {
      console.error('Error adding reply:', err);
      setError('Failed to add reply. Please try again.');
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const startReply = (commentId: string) => {
    setReplyingToId(commentId);
    setReplyText('');
  };

  const cancelReply = () => {
    setReplyingToId(null);
    setReplyText('');
  };

  // Comment component to render a single comment
  const CommentComponent = ({ 
    comment, 
    isReply = false,
    parentId = '' 
  }: { 
    comment: Comment; 
    isReply?: boolean;
    parentId?: string;
  }) => {
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef<HTMLDivElement>(null);
    const isOwner = user && comment.userId === user.id;
    
    // Close options menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
          setShowOptions(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <div className={`p-4 ${isReply ? 'ml-8 mt-2' : 'border-b border-gray-200'}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {comment.user?.profilePicture ? (
              <img
                src={comment.user.profilePicture}
                alt={`${comment.user.firstName} ${comment.user.lastName}`}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold">
                {comment.user?.firstName?.[0] || comment.user?.email?.[0] || '?'}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {comment.user?.firstName && comment.user?.lastName
                    ? `${comment.user.firstName} ${comment.user.lastName}`
                    : comment.user?.email?.split('@')[0] || 'Unknown User'}
                </p>
                <p className="text-xs text-gray-500">
                  {timeAgo(new Date(comment.createdAt))}
                  {comment.updatedAt > comment.createdAt && ' (edited)'}
                </p>
              </div>
              
              {isOwner && (
                <div className="relative" ref={optionsRef}>
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  
                  {showOptions && (
                    <div className="absolute right-0 z-10 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            startEdit(comment);
                            setShowOptions(false);
                          }}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteComment(comment.id, isReply, parentId);
                            setShowOptions(false);
                          }}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {editingCommentId === comment.id ? (
              <div className="mt-2">
                <textarea
                  ref={editInputRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditComment(comment.id)}
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
              </div>
            )}
            
            <div className="mt-2 flex items-center space-x-4">
              <ProtectedAction
                onAction={() => handleVote(comment.id, 'up', isReply, parentId)}
                buttonClassName={`flex items-center space-x-1 text-sm ${comment.userVote === 'up' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
                actionName="upvote"
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{comment.upvotes}</span>
              </ProtectedAction>
              
              <ProtectedAction
                onAction={() => handleVote(comment.id, 'down', isReply, parentId)}
                buttonClassName={`flex items-center space-x-1 text-sm ${comment.userVote === 'down' ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                actionName="downvote"
              >
                <ThumbsDown className="h-4 w-4" />
                <span>{comment.downvotes}</span>
              </ProtectedAction>
              
              {!isReply && (
                <ProtectedAction
                  onAction={() => startReply(comment.id)}
                  buttonClassName="flex items-center space-x-1 text-sm text-gray-500 hover:text-indigo-600"
                  actionName="reply"
                >
                  <Reply className="h-4 w-4" />
                  <span>Reply</span>
                </ProtectedAction>
              )}
            </div>
            
            {replyingToId === comment.id && (
              <div className="mt-3 flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold">
                      {user?.firstName?.[0] || user?.email?.[0] || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <textarea
                    ref={replyInputRef}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      onClick={cancelReply}
                      className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReply(comment.id)}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      disabled={!replyText.trim()}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Render replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4">
                {comment.replies.map(reply => (
                  <CommentComponent
                    key={reply.id}
                    comment={reply}
                    isReply={true}
                    parentId={comment.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Comments</h3>
      </div>
      
      {/* Comment input form */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleAddComment} className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold">
                {user?.firstName?.[0] || user?.email?.[0] || '?'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {!isAuthenticated ? (
              <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                Please <a href="/auth" className="text-indigo-600 hover:text-indigo-800">sign in</a> to add a comment.
              </div>
            ) : (
              <>
                <textarea
                  ref={commentInputRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newComment.trim()}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Comment
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-400 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Comments list */}
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map(comment => (
            <CommentComponent key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
} 