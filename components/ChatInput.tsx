import { Dispatch, memo, SetStateAction } from 'react';
import { Input } from './ui/input';
import { UIMessage } from 'ai';
import {
  createMessage,
  createThread,
  updateThread,
} from '@/frontend/dexie/queries';
import { useCompletion } from '@ai-sdk/react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams } from 'react-router';

function PureChatInput({
  append,
  threadId,
  status,
  setInput,
  input,
}: {
  append: (message: UIMessage) => void;
  threadId: string;
  status: 'submitted' | 'streaming' | 'ready' | 'error';
  setInput: Dispatch<SetStateAction<string>>;
  input: string;
}) {
  const navigate = useNavigate();
  const { id } = useParams();

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

  const handleSubmit = () => {
    const value = input.trim();

    if (!value) return;

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
        navigate(`/chat/${threadId}`);

        Promise.all([
          createThread(threadId),
          complete(value),
          createMessage(threadId, userMessage),
        ]).catch((error) => {
          console.error('Failed to persist chat data:', error);
        });
      } else {
        createMessage(threadId, userMessage).catch((error) => {
          console.error('Failed to save message:', error);
        });
      }
    } catch (error) {
      console.error('Failed to submit message:', error);
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
  if (prevProps.threadId !== nextProps.threadId) return false;
  return true;
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
