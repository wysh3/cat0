import Chat from '@/components/Chat';
import { useParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { getMessages } from './dexie/queries';
import { type DBMessage } from './dexie/db';
import { UIMessage } from 'ai';

export default function Thread() {
  const { id } = useParams();

  // TODO - If threadId is not found, redirect to /chat or show a 404 page

  const messages = useLiveQuery(() => getMessages(id), [id]);

  console.log('messages', { messages, id });

  const convertToUIMessages = (messages?: DBMessage[]) => {
    return messages?.map((message) => ({
      id: message.id,
      role: message.role,
      parts: message.parts as UIMessage['parts'],
      content: '',
      createdAt: message.createdAt,
    }));
  };

  return (
    <Chat
      threadId={id as string}
      initialMessages={convertToUIMessages(messages)}
    />
  );
}
