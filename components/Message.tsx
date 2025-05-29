import { Dispatch, memo, SetStateAction, useState } from 'react';
import MarkdownRenderer from '@/components/MemoizedMarkdown';
import { cn } from '@/lib/utils';
import { Message, UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import MessageControls from './MessageControls';
import { Textarea } from './ui/textarea';
import { UseChatHelpers } from '@ai-sdk/react';
import { Button } from './ui/button';
import {
  createMessage,
  deleteTrailingMessages,
} from '@/frontend/dexie/queries';

function PureMessage({
  threadId,
  message,
  isLoading,
  setMessages,
  reload,
}: {
  threadId: string;
  message: UIMessage;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  isLoading: boolean;
}) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

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
              {mode === 'edit' && (
                <MessageEditor
                  threadId={threadId}
                  message={message}
                  content={part.text}
                  setMessages={setMessages}
                  reload={reload}
                  setMode={setMode}
                />
              )}
              {mode === 'view' && <p>{part.text}</p>}

              <MessageControls
                content={part.text}
                role={message.role}
                setMode={setMode}
              />
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
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
  return true;
});

PreviewMessage.displayName = 'PreviewMessage';

export default PreviewMessage;

function MessageEditor({
  threadId,
  message,
  content,
  setMessages,
  reload,
  setMode,
}: {
  threadId: string;
  message: UIMessage;
  content: string;
  setMessages: UseChatHelpers['setMessages'];
  setMode: Dispatch<SetStateAction<'view' | 'edit'>>;
  reload: UseChatHelpers['reload'];
}) {
  const [draftContent, setDraftContent] = useState(content);

  const handleSave = async () => {
    await deleteTrailingMessages(threadId, message.createdAt as Date);

    const updatedMessage = {
      ...message,
      parts: [
        {
          type: 'text' as const,
          text: draftContent,
        },
      ],
    };

    setMessages((messages) => {
      const index = messages.findIndex((m) => m.id === message.id);

      if (index !== -1) {
        return [...messages.slice(0, index), updatedMessage];
      }

      return messages;
    });

    await createMessage(threadId, updatedMessage);

    reload();
    setMode('view');
  };

  return (
    <div>
      <Textarea
        value={draftContent}
        onChange={(e) => setDraftContent(e.target.value)}
      />
      <Button onClick={handleSave}>Save</Button>
      <Button onClick={() => setMode('view')}>Cancel</Button>
    </div>
  );
}
