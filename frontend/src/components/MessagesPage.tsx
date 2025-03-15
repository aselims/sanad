import React, { useState, useEffect, useRef } from 'react';
import { User, Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Message, Conversation, User as UserType } from '../types';
import { getConversations, getConversation, sendMessage } from '../services/messages';
import { getUserById } from '../services/users';
import { Link, useParams, useNavigate } from 'react-router-dom';

const MessagesPage: React.FC = () => {
  const { isAuthenticated, user: currentUser } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch conversations on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  // Fetch active conversation when userId changes
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchConversation(userId);
      fetchUserDetails(userId);
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

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      setError('Failed to load conversations. Please try again.');
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversation = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getConversation(userId);
      setActiveConversation(data);
    } catch (err) {
      setError('Failed to load conversation. Please try again.');
      console.error('Error fetching conversation:', err);
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
    
    setIsSending(true);
    
    try {
      const newMessage = await sendMessage(selectedUser.id, messageText);
      
      // Add the new message to the active conversation
      setActiveConversation(prev => [...prev, newMessage]);
      
      // Clear the input
      setMessageText('');
      
      // Refresh conversations list to update latest message
      fetchConversations();
      
      // Scroll to bottom
      scrollToBottom();
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with your connections</p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-[70vh]">
          {/* Conversations List */}
          <div className={`border-r border-gray-200 overflow-y-auto ${userId ? 'hidden md:block' : ''}`}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
            </div>
            {isLoading && !userId ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : error && !userId ? (
              <div className="text-red-500 p-4 text-center">{error}</div>
            ) : conversations.length > 0 ? (
              <div>
                {conversations.map((conversation) => (
                  <Link
                    key={conversation.userId}
                    to={`/messages/${conversation.userId}`}
                    className={`flex items-center p-4 hover:bg-gray-50 border-b border-gray-100 ${
                      userId === conversation.userId ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden mr-4 relative">
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
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.user.firstName} {conversation.user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.latestMessage.senderId === currentUser?.id ? 'You: ' : ''}
                        {conversation.latestMessage.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(conversation.latestMessage.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
                <p className="mt-1 text-sm text-gray-500">Start a conversation with one of your connections.</p>
              </div>
            )}
          </div>

          {/* Message Thread */}
          <div className={`col-span-1 md:col-span-2 lg:col-span-3 flex flex-col ${!userId ? 'hidden md:flex' : ''}`}>
            {userId && selectedUser ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <button
                    onClick={() => navigate('/messages')}
                    className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                  </button>
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden mr-3">
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
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedUser.position} {selectedUser.organization ? `at ${selectedUser.organization}` : ''}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Link
                      to={`/profile/${selectedUser.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : error ? (
                    <div className="text-red-500 p-4 text-center">{error}</div>
                  ) : activeConversation.length > 0 ? (
                    <div className="space-y-4">
                      {activeConversation.map((message, index) => {
                        const isCurrentUser = message.senderId === currentUser?.id;
                        const showDate = index === 0 || 
                          new Date(message.createdAt).toDateString() !== 
                          new Date(activeConversation[index - 1].createdAt).toDateString();
                        
                        return (
                          <React.Fragment key={message.id}>
                            {showDate && (
                              <div className="text-center my-4">
                                <span className="px-4 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                                  {formatDate(message.createdAt)}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] rounded-lg px-4 py-2 ${
                                isCurrentUser 
                                  ? 'bg-indigo-600 text-white rounded-br-none' 
                                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                              }`}>
                                <p>{message.content}</p>
                                <p className={`text-xs mt-1 text-right ${
                                  isCurrentUser ? 'text-indigo-200' : 'text-gray-400'
                                }`}>
                                  {formatTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Send a message to start the conversation.</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex items-end">
                    <textarea
                      ref={messageInputRef}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isSending || !messageText.trim()}
                      className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed h-10"
                    >
                      {isSending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4">
                <MessageSquare className="h-16 w-16 text-indigo-500 mb-4" />
                <h2 className="text-xl font-medium text-gray-900 mb-2">Your Messages</h2>
                <p className="text-gray-600 text-center max-w-md mb-6">
                  Select a conversation from the list or start a new one with your connections.
                </p>
                <Link
                  to="/connections"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Connections
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage; 