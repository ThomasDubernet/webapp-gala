import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Personnes } from './pages/Personnes';
import { PersonneEdit } from './pages/PersonneEdit';
import { Tables } from './pages/Tables';
import { TableEdit } from './pages/TableEdit';
import { Evenement } from './pages/Evenement';
import { Hotesse } from './pages/Hotesse';
import { Settings } from './pages/Settings';

export const router = createBrowserRouter([
  // Hotesse page without navbar (standalone)
  {
    path: '/hotesse',
    element: (
      <div className="min-h-screen bg-muted p-6">
        <Hotesse />
      </div>
    ),
  },
  // Main app with navbar
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/plan" replace /> },
      { path: 'plan', element: <Dashboard /> },
      { path: 'personnes', element: <Personnes /> },
      { path: 'personnes/new', element: <PersonneEdit /> },
      { path: 'personnes/:id/edit', element: <PersonneEdit /> },
      { path: 'personnes/:id/conjoint', element: <PersonneEdit isConjoint /> },
      { path: 'tables', element: <Tables /> },
      { path: 'tables/new', element: <TableEdit /> },
      { path: 'tables/:id/edit', element: <TableEdit /> },
      { path: 'evenement/edit', element: <Evenement /> },
      { path: 'settings', element: <Settings /> },
      // Legacy URL redirects for backward compatibility
      { path: 'personne', element: <Navigate to="/personnes" replace /> },
      { path: 'personne/new', element: <Navigate to="/personnes/new" replace /> },
      { path: 'personne/:id/edit', element: <PersonneEdit /> },
      { path: 'personne/:id/conjoint', element: <PersonneEdit isConjoint /> },
      { path: 'table', element: <Navigate to="/tables" replace /> },
      { path: 'table/new', element: <Navigate to="/tables/new" replace /> },
      { path: 'table/:id/edit', element: <TableEdit /> },
      // Catch-all: redirect unknown routes to /plan
      { path: '*', element: <Navigate to="/plan" replace /> },
    ],
  },
]);
