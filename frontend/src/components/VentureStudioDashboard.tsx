import React from 'react';
import { Outlet } from 'react-router-dom';
import { VentureStudioSidebar } from './VentureStudioSidebar';

export const VentureStudioDashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <VentureStudioSidebar />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};