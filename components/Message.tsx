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
        console.log(part);
        switch (part.type) {
          case 'text':
            return (
              <div key={`${message.id}-${index}`}>
                {message.role === 'user' ? (
                  <UserMessage content={part.text} />
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

function UserMessage({ content }: { content: string }) {
  return (
    <p className="px-4 py-3 rounded-xl bg-secondary/30 border border-secondary/30">
      {content}
    </p>
  );
}

const Message = memo(PureMessage, (prevProps, nextProps) => {
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

  return true;
});

Message.displayName = 'Message';

export default Message;
