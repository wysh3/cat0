import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Check, Copy, RefreshCcw, SquarePen } from 'lucide-react';
import { UIMessage } from 'ai';
import { UseChatHelpers } from '@ai-sdk/react';
import { deleteTrailingMessages } from '@/frontend/dexie/queries';

export default function MessageControls({
  threadId,
  message,
  setMessages,
  content,
  setMode,
  reload,
}: {
  threadId: string;
  message: UIMessage;
  setMessages: UseChatHelpers['setMessages'];
  content: string;
  setMode?: Dispatch<SetStateAction<'view' | 'edit'>>;
  reload: UseChatHelpers['reload'];
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleRegenerate = async () => {
    if (message.role === 'user') {
      await deleteTrailingMessages(threadId, message.createdAt as Date, false);

      setMessages((messages) => {
        const index = messages.findIndex((m) => m.id === message.id);

        if (index !== -1) {
          return [...messages.slice(0, index + 1)];
        }

        return messages;
      });
    } else {
      await deleteTrailingMessages(threadId, message.createdAt as Date);

      setMessages((messages) => {
        const index = messages.findIndex((m) => m.id === message.id);

        if (index !== -1) {
          return [...messages.slice(0, index)];
        }

        return messages;
      });
    }

    reload();
  };

  return (
    <div
      className={cn(
        'opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex gap-2"',
        {
          'absolute mt-5 right-2': message.role === 'user',
        }
      )}
    >
      <Button variant="ghost" size="icon" onClick={handleCopy}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
      {setMode && (
        <Button variant="ghost" size="icon" onClick={() => setMode('edit')}>
          <SquarePen className="w-4 h-4" />
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={handleRegenerate}>
        <RefreshCcw className="w-4 h-4" />
      </Button>
    </div>
  );
}
