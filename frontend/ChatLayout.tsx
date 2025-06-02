import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import ChatSidebar from '@/components/ChatSidebar';
import { Outlet } from 'react-router';

export default function ChatLayout() {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <main className="flex-1">
        <ChatSidebarTrigger />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

const ChatSidebarTrigger = () => {
  const { state } = useSidebar();
  if (state === 'collapsed') {
    return <SidebarTrigger />;
  }
  return null;
};
