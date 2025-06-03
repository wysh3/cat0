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
} from '@/components/ui/sidebar';
import { buttonVariants } from './ui/button';
import { getThreads } from '@/frontend/dexie/queries';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link, NavLink, useParams } from 'react-router';
import { cn } from '@/lib/utils';

export default function ChatSidebar() {
  const threads = useLiveQuery(() => getThreads());
  const { id: currentThreadId } = useParams();

  const handleThreadLinkClick = (threadId: string, e: React.MouseEvent) => {
    if (currentThreadId === threadId) {
      e.preventDefault();
      return;
    }
  };

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
                      <NavLink
                        to={`/chat/${thread.id}`}
                        className={cn(
                          'flex items-center w-full overflow-hidden'
                        )}
                        onClick={(e) => handleThreadLinkClick(thread.id, e)}
                      >
                        {({ isActive }) => (
                          <SidebarMenuButton
                            asChild
                            className="h-9"
                            isActive={isActive}
                          >
                            <span className="truncate">{thread.title}</span>
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
// 278 x 36 side bar item
