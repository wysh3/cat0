'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import { memo } from 'react';
import equal from 'fast-deep-equal';
import MarkdownRenderer from '@/components/markdown/MemoizedMarkdown';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    experimental_throttle: 50,
  });

  return (
    <main className="flex flex-col gap-10 w-full max-w-3xl py-24 mx-auto">
      <Messages messages={messages} />
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
    </main>
  );
}

function PureMessages({ messages }: { messages: UIMessage[] }) {
  return (
    <section>
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </section>
  );
}

const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  return true;
});

Messages.displayName = 'Messages';

function PureMessage({ message }: { message: UIMessage }) {
  return (
    <div
      className={cn(
        'flex w-full',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.parts.map((part, index) => {
        switch (part.type) {
          case 'text':
            return (
              <div key={`${message.id}-${index}`}>
                {message.role === 'user' ? (
                  <p>{part.text}</p>
                ) : (
                  // <span>{part.text}</span>
                  <MarkdownRenderer content={part.text} id={message.id} />
                )}
              </div>
            );
        }
      })}
    </div>
  );
}

const Message = memo(PureMessage, (prevProps, nextProps) => {
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

  return true;
});

Message.displayName = 'Message';

function PureChatInput({
  input,
  handleInputChange,
  handleSubmit,
}: {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={input}
        onChange={handleInputChange}
        placeholder="Say something..."
        className="fixed bottom-0 w-full max-w-3xl p-2 mb-8 rounded shadow-xl"
      />
    </form>
  );
}

const ChatInput = memo(PureChatInput, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  return true;
});

ChatInput.displayName = 'ChatInput';
