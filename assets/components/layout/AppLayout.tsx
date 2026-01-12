import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Table2,
  Settings,
  Headset,
  CalendarDays,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">
              Reservation Berth
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/logout"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </a>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
          <nav className="p-4 space-y-1">
            <NavItem
              to="/plan"
              icon={<LayoutDashboard className="h-5 w-5" />}
              label="Plan de salle"
            />
            <NavItem
              to="/personnes"
              icon={<Users className="h-5 w-5" />}
              label="Personnes"
            />
            <NavItem
              to="/tables"
              icon={<Table2 className="h-5 w-5" />}
              label="Tables"
            />
            <NavItem
              to="/evenement/edit"
              icon={<CalendarDays className="h-5 w-5" />}
              label="Événement"
            />
            <NavItem
              to="/hotesse"
              icon={<Headset className="h-5 w-5" />}
              label="Hotesse"
            />
            <NavItem
              to="/settings"
              icon={<Settings className="h-5 w-5" />}
              label="Paramètres"
            />
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 ml-64 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
