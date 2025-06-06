import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/frontend/components/ui/sidebar';
import ChatSidebar from '@/frontend/components/ChatSidebar';
import { Outlet } from 'react-router';
import ThemeToggler from './components/ui/ThemeToggler';

export default function ChatLayout() {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <main className="flex-1 relative">
        <ChatSidebarTrigger />
        <ThemeToggler />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

const ChatSidebarTrigger = () => {
  const { state } = useSidebar();
  if (state === 'collapsed') {
    return <SidebarTrigger className="fixed left-4 top-4" />;
  }
  return null;
};
