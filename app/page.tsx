'use client';
import { Input } from '@/components/ui/input';
import { useChat } from '@ai-sdk/react';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <main className="flex flex-col w-full max-w-3xl py-24 mx-auto">
      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
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
