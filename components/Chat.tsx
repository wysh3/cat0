import { useChat } from '@ai-sdk/react';
import Messages from './Messages';
import ChatInput from './ChatInput';
import { UIMessage } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { createMessage } from '@/frontend/dexie/queries';

export default function Chat({
  threadId,
  initialMessages,
}: {
  threadId: string;
  initialMessages: UIMessage[] | undefined;
}) {
  const {
    messages,
    setMessages,
    reload,
    stop,
    input,
    setInput,
    append,
    status,
  } = useChat({
    id: threadId,
    initialMessages,
    experimental_throttle: 50,
    onFinish: async ({ parts }) => {
      const aiResponse: UIMessage = {
        id: uuidv4(),
        parts: parts as UIMessage['parts'],
        role: 'assistant',
        content: '',
      };

      try {
        await createMessage(threadId, aiResponse);
      } catch (error) {
        console.error('Failed to persist AI response:', error);
      }
    },
  });

  return (
    <main className="flex flex-col w-full max-w-3xl pt-10 pb-44 mx-auto">
      <Messages
        threadId={threadId}
        messages={messages}
        status={status}
        setMessages={setMessages}
        reload={reload}
      />
      <ChatInput
        append={append}
        threadId={threadId}
        status={status}
        setInput={setInput}
        input={input}
        stop={stop}
      />
    </main>
  );
}
