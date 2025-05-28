import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/ChatSidebar';
import { Outlet } from 'react-router';

export default function ChatLayout() {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <main className="flex-1">
        <SidebarTrigger />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
