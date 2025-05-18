'use client';

import ChatInput from '@/components/ChatInput';
import Messages from '@/components/Messages';
import { useChat } from '@ai-sdk/react';

export type Status = 'ready' | 'error' | 'submitted' | 'streaming';

export default function Home() {
  const { messages, setMessages, append, stop, reload, status } = useChat({
    experimental_throttle: 50,
  });

  return (
    <main className="flex flex-col w-full max-w-3xl py-24 mx-auto">
      <Messages
        messages={messages}
        setMessages={setMessages}
        status={status}
        reload={reload}
      />
      <ChatInput append={append} stop={stop} status={status} />
    </main>
  );
}
