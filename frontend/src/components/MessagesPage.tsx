import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Send, MessageSquare, ArrowLeft, UserPlus, Search, MoreVertical, X, Phone, Video, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Message, Conversation, User as UserType } from '../types';
import { getConversations, getConversation, sendMessage } from '../services/messages';
import { getUserById } from '../services/users';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import UserProfileModal from './modals/UserProfileModal';

const MessagesPage: React.FC = () => {
  const { isAuthenticated, user: currentUser } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  // Fetch conversations data - implementation with better error handling and state management
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Setup polling for conversations to keep them updated
  useEffect(() => {
    if (isAuthenticated) {
      // Initial fetch
      fetchConversations();
      
      // Set up polling (every 30 seconds)
      pollingIntervalRef.current = window.setInterval(() => {
        fetchConversations();
        
        // If we have an active conversation, refresh it too
        if (userId) {
          fetchConversation(userId);
        }
      }, 30000);
    }
    
    return () => {
      // Clean up polling interval when component unmounts
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isAuthenticated, fetchConversations, userId]);

  // Effect to fetch active conversation when userId changes
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchConversation(userId);
      fetchUserDetails(userId);
    } else {
      // Clear active conversation when no userId is selected
      setActiveConversation([]);
      setSelectedUser(null);
    }
  }, [isAuthenticated, userId]);

  // Scroll to bottom of messages when active conversation changes
  useEffect(() => {
    scrollToBottom();
  }, [activeConversation]);

  // Focus message input when selected user changes
  useEffect(() => {
    if (selectedUser && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [selectedUser]);

  const fetchConversation = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getConversation(userId);
      setActiveConversation(data);
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError('Failed to load conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const user = await getUserById(userId);
      if (user) {
        setSelectedUser(user);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedUser) return;
    
    // Check if the selected user allows messages
    if (selectedUser.allowMessages === false) {
      setError('This user has disabled direct messages.');
      return;
    }
    
    setIsSending(true);
    
    try {
      const newMessage = await sendMessage(selectedUser.id, messageText);
      
      // Optimistically add the new message to the active conversation
      setActiveConversation(prev => [...prev, newMessage]);
      
      // Clear the input
      setMessageText('');
      
      // Refresh conversations list to update latest message
      fetchConversations();
      
      // Scroll to bottom
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter key without Shift key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    
    // Reset height to auto to properly calculate scrollHeight
    textarea.style.height = 'auto';
    
    // Set height based on content, with a max height
    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${newHeight}px`;
    
    // Update state
    setMessageText(textarea.value);
  };

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation => {
    const fullName = `${conversation.user.firstName} ${conversation.user.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const handleViewProfile = () => {
    if (selectedUser) {
      setIsProfileModalOpen(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <MessageSquare className="h-16 w-16 text-indigo-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Messages</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Sign in to view and send messages to your connections.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with your connections</p>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 h-[80vh] max-h-[80vh]">
          {/* Conversations Sidebar */}
          <div 
            className={`md:col-span-4 lg:col-span-3 border-r border-gray-200 
            ${userId ? 'hidden md:block' : 'block'} h-full flex flex-col`}
          >
            {/* Search and header */}
            <div className="p-4 border-b border-gray-200 sticky top-0 z-10 bg-white">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Conversations</h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search conversations"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 
                  focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Conversations List */}
            <div className="overflow-y-auto flex-1">
              {isLoading && !userId && conversations.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : error && !userId && conversations.length === 0 ? (
                <div className="text-red-500 p-4 text-center">
                  {error}
                  <button 
                    onClick={fetchConversations} 
                    className="mt-2 text-indigo-600 hover:text-indigo-500 font-medium text-sm"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredConversations.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredConversations.map((conversation) => (
                    <Link
                      key={conversation.userId}
                      to={`/messages/${conversation.userId}`}
                      className={`flex items-center p-4 hover:bg-gray-50 transition-colors duration-150 ${
                        userId === conversation.userId ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden mr-4 relative flex-shrink-0">
                        {conversation.user.profilePicture ? (
                          <img
                            src={conversation.user.profilePicture}
                            alt={`${conversation.user.firstName} ${conversation.user.lastName}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-indigo-600" />
                        )}
                        {conversation.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.user.firstName} {conversation.user.lastName}
                          </h3>
                          <p className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {formatTime(conversation.latestMessage.createdAt)}
                          </p>
                        </div>
                        <p className={`text-sm ${conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'} truncate`}>
                          {conversation.latestMessage.senderId === currentUser?.id ? 'You: ' : ''}
                          {conversation.latestMessage.content}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <div className="bg-gray-100 rounded-full p-4 mb-4">
                    <MessageSquare className="h-8 w-8 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No conversations yet</h3>
                  <p className="text-gray-500 mb-4">Connect with others to start messaging</p>
                  <Link
                    to="/connections"
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Find Connections
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className={`md:col-span-8 lg:col-span-9 flex flex-col h-full max-h-[80vh] ${!userId ? 'hidden md:flex' : 'flex'}`}>
            {userId && selectedUser ? (
              <>
                {/* Conversation Header */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center sticky top-0 bg-white z-10">
                  <button
                    onClick={() => navigate('/messages')}
                    className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-150"
                    aria-label="Back"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                  </button>
                  
                  <Link to={`/profile/${selectedUser.id}`} className="flex items-center flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden mr-3 flex-shrink-0">
                      {selectedUser.profilePicture ? (
                        <img
                          src={selectedUser.profilePicture}
                          alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-indigo-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-medium text-gray-900 truncate">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h2>
                      <p className="text-xs text-gray-500 truncate">
                        {selectedUser.position} {selectedUser.organization ? `at ${selectedUser.organization}` : ''}
                      </p>
                    </div>
                  </Link>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleViewProfile}
                      className="p-2 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-150"
                      aria-label="View profile"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 p-4 overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                >
                  {isLoading && activeConversation.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : error && activeConversation.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-red-500 mb-2">{error}</p>
                      <button 
                        onClick={() => fetchConversation(userId)} 
                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : activeConversation.length > 0 ? (
                    <div className="space-y-4">
                      {activeConversation.map((message, index) => {
                        const isCurrentUser = message.senderId === currentUser?.id;
                        
                        // Determine if we should show date separator
                        const showDate = index === 0 || 
                          new Date(message.createdAt).toDateString() !== 
                          new Date(activeConversation[index - 1].createdAt).toDateString();
                        
                        // Determine if we should group messages (same sender, close in time)
                        const shouldGroup = index > 0 && 
                          message.senderId === activeConversation[index - 1].senderId &&
                          new Date(message.createdAt).getTime() - new Date(activeConversation[index - 1].createdAt).getTime() < 5 * 60 * 1000; // 5 minutes
                        
                        return (
                          <React.Fragment key={message.id}>
                            {showDate && (
                              <div className="flex justify-center my-4">
                                <span className="px-4 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                                  {formatDate(message.createdAt)}
                                </span>
                              </div>
                            )}
                            
                            <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${!shouldGroup ? 'mt-4' : 'mt-1'}`}>
                              {!isCurrentUser && !shouldGroup && (
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center overflow-hidden mr-2 mt-1">
                                  {selectedUser.profilePicture ? (
                                    <img 
                                      src={selectedUser.profilePicture} 
                                      alt={`${selectedUser.firstName}`} 
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <User className="h-4 w-4 text-indigo-600" />
                                  )}
                                </div>
                              )}
                              {!isCurrentUser && shouldGroup && <div className="w-8 mr-2"></div>}
                              
                              <div 
                                className={`max-w-[85%] px-4 py-2 break-words ${
                                  isCurrentUser 
                                    ? 'bg-indigo-600 text-white rounded-t-lg rounded-bl-lg rounded-br-sm' 
                                    : 'bg-white text-gray-900 border border-gray-200 rounded-t-lg rounded-br-lg rounded-bl-sm shadow-sm'
                                } ${shouldGroup ? 
                                    (isCurrentUser ? 'rounded-tr-sm' : 'rounded-tl-sm') : 
                                    (isCurrentUser ? 'rounded-tr-lg' : 'rounded-tl-lg')
                                }`}
                              >
                                <div 
                                  className={`whitespace-pre-wrap text-sm break-words ${
                                    isCurrentUser ? 'text-white' : 'text-gray-900'
                                  }`}
                                >
                                  {message.content}
                                </div>
                                
                                <div className={`text-xs mt-1 text-right ${
                                  isCurrentUser ? 'text-indigo-200' : 'text-gray-400'
                                }`}>
                                  {formatTime(message.createdAt)}
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="bg-indigo-100 rounded-full p-4 mb-4">
                        <MessageSquare className="h-8 w-8 text-indigo-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Start the conversation</h3>
                      <p className="text-gray-500 mb-4 max-w-md">
                        Send a message to {selectedUser.firstName} to begin your conversation.
                      </p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className={`p-3 border-t border-gray-200 sticky bottom-0 bg-white z-10 transition-all duration-200 ${isTextareaFocused ? 'shadow-lg' : ''}`}>
                  {selectedUser.allowMessages === false ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                      This user has disabled direct messages.
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="flex items-end">
                      <div className="flex-1 relative">
                        <textarea
                          ref={messageInputRef}
                          value={messageText}
                          onChange={handleTextareaResize}
                          onKeyDown={handleKeyDown}
                          onFocus={() => setIsTextareaFocused(true)}
                          onBlur={() => setIsTextareaFocused(false)}
                          placeholder="Type your message..."
                          className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none max-h-[150px] overflow-y-auto"
                          style={{ minHeight: '44px' }}
                          rows={1}
                        ></textarea>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSending || !messageText.trim()}
                        className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white ${
                          isSending || !messageText.trim()
                            ? 'bg-indigo-300 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        } transition-colors duration-150`}
                      >
                        {isSending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50">
                <div className="bg-indigo-100 rounded-full p-6 mb-6">
                  <MessageSquare className="h-12 w-12 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Welcome to Messages</h2>
                <p className="text-gray-600 mb-6 text-center max-w-md">
                  Select a conversation from the sidebar or connect with other users to start new conversations.
                </p>
                <Link
                  to="/connections"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find Connections
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          userId={selectedUser.id}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSendMessage={() => {
            setIsProfileModalOpen(false);
            messageInputRef.current?.focus();
          }}
        />
      )}
    </div>
  );
};

export default MessagesPage; 