'use client';
import MarkdownRenderer from '@/components/markdown/MemoizedMarkdown';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: 'http://localhost:3001/api/chat',
  });

  return (
    <main className="flex flex-col gap-10 w-full max-w-3xl py-24 mx-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex w-full',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return (
                  <div key={`${message.id}-${i}`}>
                    {message.role === 'user' ? (
                      <p>{part.text}</p>
                    ) : (
                      <MarkdownRenderer content={part.text} />
                    )}
                  </div>
                );
            }
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Say something..."
          className="fixed bottom-0 w-full max-w-3xl p-2 mb-8 rounded shadow-xl"
        />
      </form>
    </main>
  );
}
