import { memo, useRef } from 'react';
import { Input } from './ui/input';
import { UIMessage } from 'ai';
import {
  createMessage,
  createThread,
  updateThread,
} from '@/frontend/dexie/queries';
import { UseChatHelpers, useCompletion } from '@ai-sdk/react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams } from 'react-router';

function PureChatInput({
  threadId,
  status,
  input,
  setInput,
  append,
}: {
  threadId: string;
  status: UseChatHelpers['status'];
  input: UseChatHelpers['input'];
  setInput: UseChatHelpers['setInput'];
  append: UseChatHelpers['append'];
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isCreatingThread = useRef(false);
  const isSubmitting = useRef(false);

  const { complete } = useCompletion({
    api: '/api/completion',
    onResponse: async (response) => {
      if (!response.ok) {
        const errorBody = await response.json();
        return console.log(errorBody);
      }

      const { title } = await response.json();
      await updateThread(threadId, title);
    },
  });

  const handleSubmit = async () => {
    const value = input.trim();

    if (!value || isSubmitting.current) return;

    isSubmitting.current = true;

    try {
      const userMessage: UIMessage = {
        id: uuidv4(),
        parts: [{ type: 'text', text: value }],
        role: 'user',
        content: '',
      };

      append(userMessage);
      setInput('');

      if (!id) {
        if (!isCreatingThread.current) {
          isCreatingThread.current = true;
          try {
            await createThread(threadId);
            navigate(`/chat/${threadId}`);

            await Promise.all([
              complete(value),
              createMessage(threadId, userMessage),
            ]);
          } catch (error) {
            console.error('Failed to persist chat data:', error);
            // Consider reverting navigation or showing error message
          } finally {
            isCreatingThread.current = false;
          }
        }
      } else {
        createMessage(threadId, userMessage).catch((error) => {
          console.error('Failed to save message:', error);
          // Consider showing a toast notification or inline error message
          // to inform the user that the message wasn't saved
        });
      }
    } catch (error) {
      console.error('Failed to submit message:', error);
    } finally {
      isSubmitting.current = false;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (status !== 'ready') {
        return;
      } else {
        handleSubmit();
      }
    }
  };

  return (
    <div className="fixed bottom-0 w-full max-w-3xl mb-8 backdrop-blur-lg">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}

const ChatInput = memo(PureChatInput, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
