import Chat from '@/components/Chat';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const id = uuidv4();

  return <Chat threadId={id} initialMessages={[]} />;
}
