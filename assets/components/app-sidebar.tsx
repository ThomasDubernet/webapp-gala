import * as React from 'react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Calendar,
  Download,
  FileInput,
  LayoutDashboard,
  Loader2,
  LogOut,
  RefreshCw,
  Sparkles,
  Table2,
  TableProperties,
  User,
  UserPlus,
  Users,
} from 'lucide-react'
import { apiPost } from '@/lib/api'
import { queryClient } from '@/lib/query-client'
import { useDialogs } from '@/contexts/DialogContext'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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

const navItems = [
  {
    title: 'Plan de salle',
    url: '/plan',
    icon: LayoutDashboard,
  },
  {
    title: 'Personnes',
    url: '/personnes',
    icon: Users,
  },
  {
    title: 'Tables',
    url: '/tables',
    icon: Table2,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const [syncing, setSyncing] = useState(false)
  const { openPersonneDialog, openTableDialog } = useDialogs()

  const isActive = (url: string) => {
    if (url === '/plan') {
      return location.pathname === '/plan' || location.pathname === '/'
    }
    return location.pathname === url
  }

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
        // Invalidate personnes queries to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['personnes'] })
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erreur de synchronisation',
      )
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Reservation Beth Rivkah</span>
            <span className="text-xs text-muted-foreground">
              Gestion de gala
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation principale */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Actions rapides */}
        <SidebarGroup>
          <SidebarGroupLabel>Actions rapides</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => openPersonneDialog()}>
                  <UserPlus className="h-4 w-4" />
                  <span>Créer une personne</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => openTableDialog()}>
                  <TableProperties className="h-4 w-4" />
                  <span>Créer une table</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  {syncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span>Sync BilletWeb</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/hotesse" target="_blank">
                    <User className="h-4 w-4" />
                    <span>Mode Hôtesse</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/export">
                    <Download className="h-4 w-4" />
                    <span>Export rapide</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Paramètres */}
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/evenement/edit')}
                >
                  <NavLink to="/evenement/edit">
                    <Calendar className="h-4 w-4" />
                    <span>Éditer l'évènement</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/settings')}>
                  <NavLink to="/settings">
                    <FileInput className="h-4 w-4" />
                    <span>Import / Export / Reset</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/logout">
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
