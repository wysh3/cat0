import Chat from '@/components/Chat';
import { useParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { getMessages } from './dexie/queries';
import { type DBMessage } from './dexie/db';
import { UIMessage } from 'ai';

export default function Thread() {
  const { id } = useParams();

  const messages = useLiveQuery(() => getMessages(id), [id]);

  const convertToUIMessages = (messages?: DBMessage[]) => {
    return messages?.map(
      (message): UIMessage => ({
        id: message.id,
        role: message.role,
        parts: message.parts as UIMessage['parts'],
        content: '',
        createdAt: message.createdAt,
      })
    );
  };

  return (
    <Chat
      threadId={id as string}
      initialMessages={convertToUIMessages(messages)}
    />
  );
}
