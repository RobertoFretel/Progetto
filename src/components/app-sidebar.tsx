import {
  Archive,
  FileText,
  Inbox,
  MoreHorizontal,
  Settings2,
  Star,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
} from '@/components/ui/sidebar'
import { Link, redirect } from 'react-router'
import type { User } from 'better-auth'


export const formatDate = (value: Date) =>
  new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)
  
export type Notes = { userid: string; nome: string; notaid: string; titolonota: string; updated_at: Date; }[]
export function AppSidebar({ notes, user }: { notes: Notes, user: User }) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">Notus</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => redirect("/dashboard")} isActive tooltip="Tutte le note">
                  <Inbox aria-hidden="true" />
                  <span>Tutte le note</span>
                  <Badge variant="secondary" className="ml-auto group-data-[collapsible=icon]:hidden">{notes.length}</Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Preferite">
                  <Star aria-hidden="true" />
                  <span>Preferite</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Archivio">
                  <Archive aria-hidden="true" />
                  <span>Archivio</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Note recenti</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {notes.map((note) => (
                <SidebarMenuItem key={note.notaid}>
                  <SidebarMenuButton>
                    <FileText aria-hidden="true" />
                    <Link to={`/dashboard/${note.notaid}`} className="truncate">{note.titolonota}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Impostazioni">
              <Settings2 aria-hidden="true" />
              <span>Impostazioni</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 rounded-lg px-2 py-2 group-data-[collapsible=icon]:justify-center">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">U</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">Account personale</p>
              </div>
              <MoreHorizontal className="text-muted-foreground group-data-[collapsible=icon]:hidden" aria-hidden="true" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

