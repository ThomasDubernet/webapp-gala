import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Personnes } from './pages/Personnes'
import { Tables } from './pages/Tables'
import { Evenement } from './pages/Evenement'
import { Hotesse } from './pages/Hotesse'
import { Settings } from './pages/Settings'
import { Categories } from './pages/Categories'
import ConnectedLayout from '@/components/layout/ConnectedLayout'

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
    element: <ConnectedLayout />,
    children: [
      { index: true, element: <Navigate to="/plan" replace /> },
      { path: 'plan', element: <Dashboard /> },
      { path: 'personnes', element: <Personnes /> },
      { path: 'tables', element: <Tables /> },
      { path: 'evenement/edit', element: <Evenement /> },
      { path: 'categories', element: <Categories /> },
      { path: 'settings', element: <Settings /> },
      // Legacy URL redirects
      { path: 'personne', element: <Navigate to="/personnes" replace /> },
      { path: 'table', element: <Navigate to="/tables" replace /> },
      // Catch-all: redirect unknown routes to /plan
      { path: '*', element: <Navigate to="/plan" replace /> },
    ],
  },
])
