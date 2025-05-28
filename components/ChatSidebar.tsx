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
} from '@/components/ui/sidebar';
import { Button, buttonVariants } from './ui/button';
import { Input } from './ui/input';
import { deleteAllThreads, getThreads } from '@/frontend/dexie/queries';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link, NavLink, useParams } from 'react-router';
import { cn } from '@/lib/utils';

export default function ChatSidebar() {
  const threads = useLiveQuery(() => getThreads());
  const { id: currentThreadId } = useParams();

  const handleThreadClick = (threadId: string, e: React.MouseEvent) => {
    if (currentThreadId === threadId) {
      e.preventDefault();
      return;
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Satori</h1>
        <Link
          to="/chat"
          className={buttonVariants({
            variant: 'outline',
            className: 'w-full',
          })}
        >
          New Chat
        </Link>
        <Button variant="outline" className="w-full" onClick={deleteAllThreads}>
          Clear All Chats
        </Button>
        <Input placeholder="Search chats" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {threads?.map((thread) => (
                <SidebarMenuItem key={thread.id}>
                  <NavLink
                    to={`/chat/${thread.id}`}
                    className={({ isActive }) => (isActive ? 'bg-red-600' : '')}
                    onClick={(e) => handleThreadClick(thread.id, e)}
                  >
                    <SidebarMenuButton asChild>
                      <span className="truncate block">{thread.title}</span>
                    </SidebarMenuButton>
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
