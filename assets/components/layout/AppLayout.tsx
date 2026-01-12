import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Settings,
  User,
  LogOut,
  Download,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SearchBar } from '../Search';

function NavButton({
  to,
  children,
  className,
  end = false,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
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
            {!isHome && <NavButton to="/plan" end>Accès au plan</NavButton>}
            <NavButton to="/tables/new" end>Créer une table</NavButton>
            <NavButton to="/personnes/new" end>Créer une personne</NavButton>
            <NavButton to="/personnes" end>Liste des personnes</NavButton>
            <div className="mx-4 w-64">
              <SearchBar />
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
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <NavLink
                    to="/evenement/edit"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setSettingsOpen(false)}
                  >
                    Editer l'évènement
                  </NavLink>
                  <NavLink
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setSettingsOpen(false)}
                  >
                    Import / Export / Reset
                  </NavLink>
                  <a
                    href="/export"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export rapide
                  </a>
                  <hr className="my-2 border-gray-200" />
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
                <SearchBar />
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
