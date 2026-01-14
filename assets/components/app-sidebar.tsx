import * as React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Download,
  FileEdit,
  Import,
  LayoutGrid,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Table2,
  User,
  Users,
} from 'lucide-react'

import { apiPost } from '@/lib/api'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'

// Navigation items
const navMain = [
  { title: 'Plan', url: '/plan', icon: LayoutGrid },
  { title: 'Tables', url: '/tables', icon: Table2 },
  { title: 'Personnes', url: '/personnes', icon: Users },
]

const navCreate = [
  { title: 'Créer une table', url: '/tables/new', icon: Plus },
  { title: 'Créer une personne', url: '/personnes/new', icon: Plus },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const [syncing, setSyncing] = React.useState(false)

  const handleBilletWebSync = async () => {
    setSyncing(true)
    try {
      const data = await apiPost<{ message: string; error?: string }>(
        '/api/billet-web/sync',
      )
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success(data.message)
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erreur de synchronisation',
      )
    } finally {
      setSyncing(false)
    }
  }

  const isActive = (url: string) => {
    if (url === '/plan') {
      return location.pathname === '/plan' || location.pathname === '/'
    }
    if (url === '/tables') {
      return (
        location.pathname === '/tables' ||
        location.pathname.startsWith('/tables/')
      )
    }
    if (url === '/personnes') {
      return (
        location.pathname === '/personnes' ||
        location.pathname.startsWith('/personnes/')
      )
    }
    return location.pathname === url
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* Logo only - not clickable, takes full sidebar width */}
        <div className="flex items-center justify-center py-2 px-2 group-data-[collapsible=icon]:px-0">
          <img
            className="w-full h-auto object-contain group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
            src="/logo-2.png"
            alt="logo"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Create */}
        <SidebarGroup>
          <SidebarGroupLabel>Création rapide</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navCreate.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleBilletWebSync}
                  disabled={syncing}
                  tooltip="Synchroniser BilletWeb"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  {syncing ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <RefreshCw />
                  )}
                  <span>Sync BilletWeb</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Mode Hôtesse">
                  <NavLink to="/hotesse">
                    <User />
                    <span>Hôtesse</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Paramètres</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/evenement/edit'}
                  tooltip="Éditer l'événement"
                >
                  <NavLink to="/evenement/edit">
                    <FileEdit />
                    <span>Éditer l'événement</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/settings'}
                  tooltip="Import / Export / Reset"
                >
                  <NavLink to="/settings">
                    <Import />
                    <span>Import / Export / Reset</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Export rapide">
                  <a href="/export">
                    <Download />
                    <span>Export rapide</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Déconnexion"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <a href="/logout">
                    <LogOut />
                    <span>Déconnexion</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
