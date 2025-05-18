import { memo, useState } from 'react';
import MarkdownRenderer from '@/components/markdown/MemoizedMarkdown';
import { cn } from '@/lib/utils';
import { ChatRequestOptions, Message, UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import MessageControls from './MessageControls';

function PureMessage({
  message,
  setMessages,
  isLoading,
  reload,
}: {
  message: UIMessage;
  setMessages: (messages: Message[]) => void;
  reload: (chatRequestOptions?: ChatRequestOptions) => void;
  isLoading: boolean;
}) {
  return (
    <div
      className={cn(
        'flex w-full',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.parts.map((part, index) => {
        const { type } = part;
        const key = `message-${message.id}-part-${index}`;

        if (type === 'text') {
          return message.role === 'user' ? (
            <div
              key={key}
              className="relative group px-4 py-3 rounded-xl bg-secondary/30 border border-secondary/30 max-w-[80%]"
            >
              <p>{part.text}</p>

              <MessageControls content={part.text} role={message.role} />
            </div>
          ) : (
            <div key={key} className="group flex flex-col gap-2 w-full">
              <MarkdownRenderer content={part.text} id={message.id} />
              {!isLoading && (
                <MessageControls content={part.text} role={message.role} />
              )}
            </div>
          );
        }
      })}
    </div>
  );
}

const PreviewMessage = memo(PureMessage, (prevProps, nextProps) => {
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  return true;
});

PreviewMessage.displayName = 'PreviewMessage';

export default PreviewMessage;

const something = (
  message: UIMessage,
  mode: 'view' | 'edit',
  setMode: (mode: 'view' | 'edit') => void,
  setMessages: (messages: Message[]) => void,
  reload: (chatRequestOptions?: ChatRequestOptions) => void
) => {
  return;
};
