import { memo, useRef, useCallback } from 'react';
import { Input } from './ui/input';
import { Message } from 'ai';

function PureChatInput({ append }: { append: (message: Message) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
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
  }, [append]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="fixed bottom-0 w-full max-w-3xl mb-8">
      <Input ref={inputRef} onKeyDown={onKeyDown} />
    </div>
  );
}

const ChatInput = memo(PureChatInput, (prevProps, nextProps) => {
  return prevProps.append === nextProps.append;
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
