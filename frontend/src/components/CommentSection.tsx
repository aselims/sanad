import React, { useState, useEffect, useRef } from 'react';
import { Send, ThumbsUp, ThumbsDown, MoreVertical, Trash2, Edit3, Reply, X, MessageCircle, AlertCircle } from 'lucide-react';
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
    // Don't try to load comments if collaborationId is missing or invalid
    if (!collaborationId || collaborationId.trim() === '') {
      setError('Invalid collaboration ID');
      setIsLoading(false);
      return;
    }
    
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
    } catch (err: any) {
      console.error('Error fetching comments from API:', err);
      if (err.response?.status === 404) {
        setError('Comments feature not available for this collaboration');
      } else {
        setError('Failed to load comments. Please try again later.');
      }
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
      <div className={`${isReply ? 'ml-8 mt-3' : ''}`}>
        <div className={`bg-white rounded-lg border border-slate-200 p-4 ${!isReply ? 'shadow-sm hover:shadow-md' : 'bg-slate-50 border-slate-300'} transition-shadow duration-200`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {comment.user?.profilePicture ? (
                <img
                  src={comment.user.profilePicture}
                  alt={`${comment.user.firstName} ${comment.user.lastName}`}
                  className="h-8 w-8 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                  {comment.user?.firstName?.[0] || comment.user?.email?.[0] || '?'}
                </div>
              )}
            </div>
          
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {comment.user?.firstName && comment.user?.lastName
                      ? `${comment.user.firstName} ${comment.user.lastName}`
                      : comment.user?.email?.split('@')[0] || 'Unknown User'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {timeAgo(new Date(comment.createdAt))}
                    {comment.updatedAt > comment.createdAt && (
                      <span className="text-slate-400 ml-1">(edited)</span>
                    )}
                  </p>
                </div>
              
                {isOwner && (
                  <div className="relative" ref={optionsRef}>
                    <button
                      onClick={() => setShowOptions(!showOptions)}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors duration-200"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {showOptions && (
                      <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg bg-white shadow-lg ring-1 ring-slate-200 border border-slate-100">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              startEdit(comment);
                              setShowOptions(false);
                            }}
                            className="flex w-full items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteComment(comment.id, isReply, parentId);
                              setShowOptions(false);
                            }}
                            className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
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
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <textarea
                    ref={editInputRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>
              )}
            
              <div className="mt-4 flex items-center gap-4">
                <ProtectedAction
                  onAction={() => handleVote(comment.id, 'up', isReply, parentId)}
                  buttonClassName={`flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-all duration-200 ${
                    comment.userVote === 'up' 
                      ? 'text-green-600 bg-green-50 font-medium' 
                      : 'text-slate-500 hover:text-green-600 hover:bg-green-50'
                  }`}
                  actionName="upvote"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{comment.upvotes}</span>
                </ProtectedAction>
                
                <ProtectedAction
                  onAction={() => handleVote(comment.id, 'down', isReply, parentId)}
                  buttonClassName={`flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-all duration-200 ${
                    comment.userVote === 'down' 
                      ? 'text-red-600 bg-red-50 font-medium' 
                      : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                  }`}
                  actionName="downvote"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>{comment.downvotes}</span>
                </ProtectedAction>
                
                {!isReply && (
                  <ProtectedAction
                    onAction={() => startReply(comment.id)}
                    buttonClassName="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                    actionName="reply"
                  >
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </ProtectedAction>
                )}
              </div>
            
              {replyingToId === comment.id && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-8 w-8 rounded-full object-cover border-2 border-slate-200"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                          {user?.firstName?.[0] || user?.email?.[0] || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <textarea
                        ref={replyInputRef}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a thoughtful reply..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        rows={2}
                      />
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={cancelReply}
                          className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReply(comment.id)}
                          className={`px-4 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                            replyText.trim()
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                          disabled={!replyText.trim()}
                        >
                          Post Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            
            </div>
          </div>
        </div>
        
        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
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
    );}
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MessageCircle className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Discussion</h3>
          <p className="text-sm text-slate-600">
            {comments.length === 0 ? 'Start the conversation' : `${comments.length} comment${comments.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>
      
      {/* Comment input form */}
      <div className="mb-6">
        <form onSubmit={handleAddComment} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="h-10 w-10 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.firstName?.[0] || user?.email?.[0] || '?'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {!isAuthenticated ? (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    Please <a href="/auth" className="font-medium text-blue-600 hover:text-blue-800 underline">sign in</a> to join the discussion.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    ref={commentInputRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on this idea..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className={`inline-flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        newComment.trim() 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      disabled={!newComment.trim()}
                    >
                      <Send className="h-4 w-4" />
                      Post Comment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="p-1 text-red-400 hover:text-red-600 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Comments list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="flex justify-center mb-3">
              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">No Comments Yet</h4>
            <p className="text-slate-600 max-w-md mx-auto">
              Be the first to share your thoughts on this innovative idea. Your feedback could help shape its development!
            </p>
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