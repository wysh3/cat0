import { memo } from 'react';
import MarkdownRenderer from '@/components/markdown/MemoizedMarkdown';
import { cn } from '@/lib/utils';
import { UIMessage } from 'ai';
import equal from 'fast-deep-equal';

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

export default Message;
