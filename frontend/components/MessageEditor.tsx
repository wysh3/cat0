import {
  createMessage,
  deleteTrailingMessages,
  createMessageSummary,
} from '@/frontend/dexie/queries';
import { UseChatHelpers } from '@ai-sdk/react';
import { useState } from 'react';
import { UIMessage } from 'ai';
import { Dispatch, SetStateAction } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useMessageSummary } from '../hooks/useMessageSummary';

export default function MessageEditor({
  threadId,
  message,
  content,
  setMessages,
  reload,
  setMode,
  stop,
}: {
  threadId: string;
  message: UIMessage;
  content: string;
  setMessages: UseChatHelpers['setMessages'];
  setMode: Dispatch<SetStateAction<'view' | 'edit'>>;
  reload: UseChatHelpers['reload'];
  stop: UseChatHelpers['stop'];
}) {
  const [draftContent, setDraftContent] = useState(content);
  const { complete } = useMessageSummary();

  const handleSave = async () => {
    try {
      // Delete trailing messages
      const deleteResult = await deleteTrailingMessages(threadId, message.createdAt as Date);
      if (deleteResult.error) {
        toast.error(`Failed to delete old messages: ${deleteResult.error.message}`);
        return;
      }

      const updatedMessage = {
        ...message,
        id: uuidv4(),
        content: draftContent,
        parts: [
          {
            type: 'text' as const,
            text: draftContent,
          },
        ],
        createdAt: new Date(),
      };

      // Save the updated message
      const createResult = await createMessage(threadId, updatedMessage);
      if (createResult.error) {
        toast.error(`Failed to save message: ${createResult.error.message}`);
        return;
      }

      setMessages((messages) => {
        const index = messages.findIndex((m) => m.id === message.id);

        if (index !== -1) {
          return [...messages.slice(0, index), updatedMessage];
        }

        return messages;
      });

      complete(draftContent, {
        body: {
          messageId: updatedMessage.id,
          threadId,
        },
      });
      setMode('view');

      // stop the current stream if any
      stop();

      setTimeout(() => {
        reload();
      }, 0);
      
      toast.success('Message updated successfully');
    } catch (error) {
      console.error('Failed to save message:', error);
      toast.error('An unexpected error occurred while saving the message');
    }
  };

  return (
    <div>
      <Textarea
        value={draftContent}
        onChange={(e) => setDraftContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
          }
        }}
      />
      <div className="flex gap-2 mt-2">
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={() => setMode('view')}>Cancel</Button>
      </div>
    </div>
  );
}
