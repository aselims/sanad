import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CollaborationProvider } from './contexts/CollaborationContext';
import { ProfileProvider } from './contexts/ProfileContext';
import './index.css';

// Patch WebSocket to prevent connections to invalid URLs
const originalWebSocket = window.WebSocket;
window.WebSocket = function(url: string, protocols?: string | string[]) {
  // Skip creating WebSocket for invalid URLs that cause errors
  if (url.includes('localhost:undefined') || 
      url === 'wss://sanad.selimsalman.de/' ||
      !url.match(/^wss?:\/\/[^/]+/)) {
    console.log('Prevented WebSocket connection to invalid URL:', url);
    // Return a dummy WebSocket object that does nothing
    return {
      send: () => {},
      close: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      readyState: 3, // CLOSED
      CONNECTING: 0,
      OPEN: 1, 
      CLOSING: 2,
      CLOSED: 3
    };
  }
  // For valid URLs, use the original WebSocket constructor
  return new originalWebSocket(url, protocols);
} as any;
// Copy over static properties
Object.assign(window.WebSocket, originalWebSocket);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <CollaborationProvider>
            <App />
          </CollaborationProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
