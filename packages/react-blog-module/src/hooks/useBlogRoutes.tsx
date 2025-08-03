import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Blog } from '../Blog';
import { BlogConfig } from '../types';

interface UseBlogRoutesProps {
  config: BlogConfig;
  footerContent?: React.ReactNode;
}

export const useBlogRoutes = ({ config, footerContent }: UseBlogRoutesProps) => {
  return (
    <Routes>
      <Route 
        path={config.basePath} 
        element={<Blog config={config} footerContent={footerContent} />} 
      />
      <Route 
        path={`${config.basePath}/:slug`} 
        element={<Blog config={config} footerContent={footerContent} />} 
      />
    </Routes>
  );
};

// Higher-order component for easier integration
export const withBlogRoutes = (config: BlogConfig, footerContent?: React.ReactNode) => {
  return () => {
    const routes = useBlogRoutes({ config, footerContent });
    return routes;
  };
};