import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Menu,
  X,
  Settings,
  User,
  LogOut,
  Download,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { apiPost } from '../../lib/api';
import { SearchBar } from '../Search';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

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
            ? 'text-primary-foreground bg-primary border-primary'
            : 'text-primary border-primary hover:bg-primary/10',
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
  const [syncing, setSyncing] = useState(false);

  const isHome = location.pathname === '/plan' || location.pathname === '/';

  const handleBilletWebSync = async () => {
    setSyncing(true);

    try {
      const data = await apiPost<{ message: string; error?: string }>('/api/billet-web/sync');
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="h-16 bg-card border-b border-border shadow-sm relative z-40">
        <div className="h-full max-w-full mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/plan" className="flex-shrink-0">
            <img className="h-11" src="/logo-2.jpeg" alt="logo" />
          </NavLink>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
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
            <NavButton to="/tables" end>Tables</NavButton>
            <NavButton to="/personnes" end>Personnes</NavButton>
            <div className="mx-4 w-64">
              <SearchBar />
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden lg:flex lg:items-center lg:gap-2">
            {/* BilletWeb sync button */}
            <button
              type="button"
              onClick={handleBilletWebSync}
              disabled={syncing}
              className="p-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Synchroniser avec BilletWeb"
            >
              {syncing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}
            </button>

            {/* Hostess button */}
            <NavLink
              to="/hotesse"
              className="p-2 text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors"
            >
              <User className="h-5 w-5" />
            </NavLink>

            {/* Settings dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-2 text-muted-foreground border border-input rounded-lg hover:bg-accent transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <NavLink to="/evenement/edit">
                    Editer l'évènement
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/settings">
                    Import / Export / Reset
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/export" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export rapide
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/logout" className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
            <div className="px-4 py-3 space-y-2">
              {!isHome && (
                <NavLink
                  to="/plan"
                  className="block px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Accès au plan
                </NavLink>
              )}
              <NavLink
                to="/tables/new"
                className="block px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Créer une table
              </NavLink>
              <NavLink
                to="/personnes/new"
                className="block px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Créer une personne
              </NavLink>
              <NavLink
                to="/tables"
                className="block px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tables
              </NavLink>
              <NavLink
                to="/personnes"
                className="block px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Personnes
              </NavLink>
              <div className="pt-2">
                <SearchBar />
              </div>
              <hr className="my-3 border-border" />
              <div className="flex gap-2">
                <NavLink
                  to="/hotesse"
                  className="flex-1 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hôtesse
                </NavLink>
                <NavLink
                  to="/evenement/edit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground border border-input rounded-lg hover:bg-accent text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Paramètres
                </NavLink>
              </div>
              <a
                href="/logout"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground border border-input rounded-lg hover:bg-accent text-center"
              >
                Déconnexion
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="pt-4 px-4">
        <Outlet />
      </main>
    </div>
  );
}
