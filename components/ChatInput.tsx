import { memo, useRef, useCallback } from 'react';
import { Input } from './ui/input';
import { Message } from 'ai';

function PureChatInput({
  append,
  stop,
  status,
}: {
  append: (message: Message) => void;
  stop: () => void;
  status: 'submitted' | 'streaming' | 'ready' | 'error';
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const value = inputRef.current?.value;

    if (value && value.trim()) {
      append({
        id: crypto.randomUUID(),
        content: value.trim(),
        role: 'user',
      });

      if (inputRef.current) {
        inputRef.current.value = '';
      }
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
    <div className="fixed bottom-0 w-full max-w-3xl mb-8">
      <Input ref={inputRef} onKeyDown={onKeyDown} />
    </div>
  );
}

const ChatInput = memo(PureChatInput, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  return true;
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
