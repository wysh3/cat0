import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/frontend/components/ui/sidebar';
import { buttonVariants } from './ui/button';
import { getThreads } from '@/frontend/dexie/queries';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link, NavLink } from 'react-router';

export default function ChatSidebar() {
  const threads = useLiveQuery(() => getThreads());

  return (
    <Sidebar>
      <div className="flex flex-col h-full p-2">
        <SidebarHeader className="flex justify-between items-center gap-4 relative">
          <SidebarTrigger className="absolute right-1 top-2.5" />
          <h1 className="text-2xl font-bold font-serif">Satori</h1>
          <Link
            to="/chat"
            className={buttonVariants({
              variant: 'secondary',
              className: 'w-full',
            })}
          >
            New Chat
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {threads?.map((thread) => {
                  return (
                    <SidebarMenuItem key={thread.id}>
                      <NavLink to={`/chat/${thread.id}`}>
                        {({ isActive }) => (
                          <SidebarMenuButton
                            asChild
                            className="relative group h-9 flex items-center overflow-hidden"
                            isActive={isActive}
                          >
                            <span className="truncate block">
                              {thread.title}
                            </span>
                          </SidebarMenuButton>
                        )}
                      </NavLink>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          {/* TODO: Add Settings Page */}
          <Link
            to="/settings"
            className={buttonVariants({ variant: 'outline' })}
          >
            Settings
          </Link>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
