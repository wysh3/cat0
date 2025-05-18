import { memo, useState } from 'react';
import MarkdownRenderer from '@/components/markdown/MemoizedMarkdown';
import { cn } from '@/lib/utils';
import { UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import { Check, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Status } from '@/lib/types';

function PureMessage({
  message,
  status,
}: {
  message: UIMessage;
  status: Status;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return message.parts.map((part, index) => {
    console.log(part);
    switch (part.type) {
      case 'text':
        return (
          <div
            key={`${message.id}-${index}`}
            className={cn(
              'flex w-full',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'user' ? (
              <div className="relative group px-4 py-3 rounded-xl bg-secondary/30 border border-secondary/30 max-w-[80%]">
                {part.text}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-100 absolute mt-5 right-2">
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="group flex flex-col gap-2 w-full">
                <MarkdownRenderer content={part.text} id={message.id} />
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex gap-2">
                  {status === 'ready' && (
                    <Button variant="ghost" size="icon" onClick={handleCopy}>
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
    }
  });
}

const Message = memo(PureMessage, (prevProps, nextProps) => {
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
  if (prevProps.status !== nextProps.status) return false;
  return true;
});

Message.displayName = 'Message';

export default Message;
