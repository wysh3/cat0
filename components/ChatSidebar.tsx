import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function ChatSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Satori</h1>
        <Button className="w-full" variant="outline">
          Create Chat
        </Button>
        <Input placeholder="Search chats" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
