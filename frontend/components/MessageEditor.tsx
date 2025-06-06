import { createMessage } from '@/frontend/dexie/queries';
import { UseChatHelpers } from '@ai-sdk/react';
import { useState } from 'react';
import { UIMessage } from 'ai';
import { Dispatch, SetStateAction } from 'react';
import { deleteTrailingMessages } from '@/frontend/dexie/queries';
import { v4 as uuidv4 } from 'uuid';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

export default function MessageEditor({
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
    try {
      await deleteTrailingMessages(threadId, message.createdAt as Date);

      const updatedMessage = {
        ...message,
        id: uuidv4(),
        parts: [
          {
            type: 'text' as const,
            text: draftContent,
          },
        ],
      };

      await createMessage(threadId, updatedMessage);

      setMessages((messages) => {
        const index = messages.findIndex((m) => m.id === message.id);

        if (index !== -1) {
          return [...messages.slice(0, index), updatedMessage];
        }

        return messages;
      });

      reload();
      setMode('view');
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  return (
    <div>
      <Textarea
        value={draftContent}
        onChange={(e) => setDraftContent(e.target.value)}
      />
      <div className="flex gap-2 mt-2">
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={() => setMode('view')}>Cancel</Button>
      </div>
    </div>
  );
}
