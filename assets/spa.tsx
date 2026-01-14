/*
 * Entry point for the React SPA
 * This replaces the Twig-based pages with a full React application
 */

import './styles/tailwind.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { SpaApp } from './SpaApp';

// Mount the React SPA
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <SpaApp />
    </React.StrictMode>
  );
}
