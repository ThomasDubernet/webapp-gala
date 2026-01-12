import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Settings,
  User,
  LogOut,
  Upload,
  Download,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

function NavButton({
  to,
  children,
  className,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'px-4 py-2 text-sm font-medium border rounded-lg transition-colors',
          isActive
            ? 'text-white bg-blue-600 border-blue-600'
            : 'text-blue-600 border-blue-600 hover:bg-blue-50',
          className
        )
      }
    >
      {children}
    </NavLink>
  );
}

export function AppLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const isHome = location.pathname === '/plan' || location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="h-16 bg-white border-b border-gray-200 shadow-sm relative z-40">
        <div className="h-full max-w-full mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/plan" className="flex-shrink-0">
            <img className="h-11" src="/logo-2.jpeg" alt="logo" />
          </NavLink>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-expanded={mobileMenuOpen}
          >
            <span className="sr-only">Ouvrir le menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-2 lg:flex-1 lg:justify-center">
            {!isHome && <NavButton to="/plan">Accès au plan</NavButton>}
            <NavButton to="/tables/new">Créer une table</NavButton>
            <NavButton to="/personnes/new">Créer une personne</NavButton>
            <NavButton to="/personnes">Liste des personnes</NavButton>
            <div className="mx-4">
              {/* Search component will be added here */}
              <input
                type="search"
                placeholder="Rechercher"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden lg:flex lg:items-center lg:gap-2">
            {/* Hostess button */}
            <NavLink
              to="/hotesse"
              className="p-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <User className="h-5 w-5" />
            </NavLink>

            {/* Settings dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <NavLink
                    to="/evenement/edit"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setSettingsOpen(false)}
                  >
                    Editer l'évènement
                  </NavLink>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Import file
                    </label>
                    <input
                      type="file"
                      className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Sync avec BilletWeb
                  </button>
                  <a
                    href="/export"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exporter
                  </a>
                  <hr className="my-2 border-gray-200" />
                  <button
                    type="button"
                    onClick={() => {
                      setResetModalOpen(true);
                      setSettingsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Réinitialiser
                  </button>
                  <a
                    href="/logout"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="px-4 py-3 space-y-2">
              {!isHome && (
                <NavLink
                  to="/plan"
                  className="block px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Accès au plan
                </NavLink>
              )}
              <NavLink
                to="/tables/new"
                className="block px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Créer une table
              </NavLink>
              <NavLink
                to="/personnes/new"
                className="block px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Créer une personne
              </NavLink>
              <NavLink
                to="/personnes"
                className="block px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Liste des personnes
              </NavLink>
              <div className="pt-2">
                <input
                  type="search"
                  placeholder="Rechercher"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <hr className="my-3 border-gray-200" />
              <div className="flex gap-2">
                <NavLink
                  to="/hotesse"
                  className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hôtesse
                </NavLink>
                <NavLink
                  to="/evenement/edit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Paramètres
                </NavLink>
              </div>
              <a
                href="/logout"
                className="block px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
              >
                Déconnexion
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Reset modal */}
      {resetModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setResetModalOpen(false)}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Réinitialiser l'évènement
              </h3>
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        'Etes-vous sur de vouloir supprimer les personnes sans table?'
                      )
                    ) {
                      // TODO: Call API
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer les personnes sans table
                </button>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Garder la salle
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Tout réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close settings */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setSettingsOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="pt-4 px-4">
        <Outlet />
      </main>
    </div>
  );
}
