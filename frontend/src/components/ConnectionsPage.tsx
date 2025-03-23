import React, { useState, useEffect } from 'react';
import { User, Check, X, UserPlus, Users, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Connection, ConnectionStatus } from '../types';
import { getConnectionRequests, getUserConnections, respondToConnectionRequest } from '../services/connections';
import { Link } from 'react-router-dom';
import UserProfileModal from './modals/UserProfileModal';

const ConnectionsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'connections' | 'requests'>('connections');
  const [connections, setConnections] = useState<any[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (activeTab === 'connections') {
        const data = await getUserConnections();
        setConnections(data);
      } else {
        const data = await getConnectionRequests();
        setConnectionRequests(data);
      }
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondToRequest = async (connectionId: string, action: 'accept' | 'reject') => {
    try {
      await respondToConnectionRequest(connectionId, action);
      // Remove the request from the list
      setConnectionRequests(prev => prev.filter(req => req.id !== connectionId));
      
      // If accepted, refresh connections
      if (action === 'accept') {
        const data = await getUserConnections();
        setConnections(data);
      }
    } catch (err) {
      setError('Failed to respond to request. Please try again.');
      console.error('Error responding to request:', err);
    }
  };

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId);
    setIsProfileModalOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Users className="h-16 w-16 text-indigo-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Your Connections</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Sign in to view and manage your connections and connection requests.
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
          <p className="text-gray-600">Manage your network connections</p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('connections')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'connections'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Connections
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Connection Requests
              {connectionRequests.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {connectionRequests.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 text-center">{error}</div>
          ) : activeTab === 'connections' ? (
            connections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((connection) => {
                  if (!connection.user) {
                    console.error("Missing user data in connection:", connection);
                    return null;
                  }
                  
                  return (
                    <div key={connection.id} className="border rounded-lg p-4 flex items-center">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden mr-4">
                        {connection.user.profilePicture ? (
                          <img
                            src={connection.user.profilePicture}
                            alt={`${connection.user.firstName} ${connection.user.lastName}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-indigo-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {connection.user.firstName} {connection.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {connection.user.position} {connection.user.organization ? `at ${connection.user.organization}` : ''}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewProfile(connection.user.id)}
                          className="p-2 text-indigo-600 hover:text-indigo-800"
                          title="View Profile"
                        >
                          <User className="h-5 w-5" />
                        </button>
                        <Link
                          to={`/messages/${connection.user.id}`}
                          className="p-2 text-green-600 hover:text-green-800"
                          title="Send Message"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No connections yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by connecting with other users.</p>
              </div>
            )
          ) : connectionRequests.length > 0 ? (
            <div className="space-y-4">
              {connectionRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 flex items-center">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden mr-4">
                    {request.requester?.profilePicture ? (
                      <img
                        src={request.requester.profilePicture}
                        alt={`${request.requester.firstName} ${request.requester.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-indigo-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {request.requester?.firstName} {request.requester?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {request.requester?.position} {request.requester?.organization ? `at ${request.requester.organization}` : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Sent {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'accept')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:border-green-700 focus:shadow-outline-green active:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'reject')}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
              <p className="mt-1 text-sm text-gray-500">You don't have any pending connection requests.</p>
            </div>
          )}
        </div>
      </div>

      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ConnectionsPage; 