'use client';

import { ChevronDown, Check, ArrowUpIcon } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useAutoResizeTextarea from '@/hooks/useAutoResizeTextArea';
import { UseChatHelpers, useCompletion } from '@ai-sdk/react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router';
import {
  createMessage,
  createThread,
  updateThread,
} from '@/frontend/dexie/queries';
import { useAPIKeysStore } from '@/frontend/stores/APIKeysStore';
import { useModelStore } from '@/frontend/stores/ModelStore';
import { AI_MODELS } from '@/lib/models';
import KeyPrompt from '@/components/KeyPrompt';
import { UIMessage } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { StopIcon } from './ui/icons';
import { toast } from 'sonner';

interface ChatInputProps {
  threadId: string;
  input: UseChatHelpers['input'];
  status: UseChatHelpers['status'];
  setInput: UseChatHelpers['setInput'];
  append: UseChatHelpers['append'];
  stop: UseChatHelpers['stop'];
}

interface StopButtonProps {
  stop: UseChatHelpers['stop'];
}

interface SendButtonProps {
  onSubmit: () => void;
  disabled: boolean;
}

const createUserMessage = (text: string): UIMessage => ({
  id: uuidv4(),
  parts: [{ type: 'text', text }],
  role: 'user',
  content: text,
});

function PureChatInput({
  threadId,
  input,
  status,
  setInput,
  append,
  stop,
}: ChatInputProps) {
  const hasRequiredKeys = useAPIKeysStore((state) => state.hasRequiredKeys());
  const getKey = useAPIKeysStore((state) => state.getKey);
  const { selectedModel, setModel } = useModelStore();

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 200,
  });

  const navigate = useNavigate();
  const { id } = useParams();

  const isDisabled = useMemo(
    () => !input.trim() || status !== 'ready',
    [input, status]
  );

  const { complete } = useCompletion({
    api: '/api/completion',
    headers: {
      'X-Google-API-Key': getKey('google') || '',
    },
    onResponse: async (response) => {
      try {
        if (response.ok) {
          const { title } = await response.json();
          await updateThread(threadId, title);
        } else {
          const { error } = await response.json();
          toast.error(error || 'Failed to generate a title for this thread');
        }
      } catch (error) {
        console.error(error);
        // TODO - Handle Dexie Error
      }
    },
  });

  const handleNewThreadSubmission = useCallback(
    async (userMessage: UIMessage) => {
      await createThread(threadId);
      navigate(`/chat/${threadId}`);

      await Promise.all([
        // Todo - What if the user message is not created? some error occured
        await createMessage(threadId, userMessage),
        await complete(userMessage.content),
      ]);
    },
    [threadId, navigate, complete]
  );

  const handleExistingThreadSubmission = useCallback(
    async (userMessage: UIMessage) => {
      await createMessage(threadId, userMessage);
    },
    [threadId]
  );

  const handleSubmit = useCallback(async () => {
    const currentInput = textareaRef.current?.value || input;

    if (!currentInput.trim() || status !== 'ready') return;

    const userMessage = createUserMessage(currentInput.trim());

    try {
      setInput('');
      adjustHeight(true);

      append(userMessage);

      if (!id) {
        await handleNewThreadSubmission(userMessage);
      } else {
        await handleExistingThreadSubmission(userMessage);
      }
    } catch (error) {
      console.error(error);
      // TODO - Handle Dexie Error Either Thread Creation Failed or User Message Failed
    }
  }, [
    input,
    status,
    setInput,
    adjustHeight,
    append,
    id,
    handleNewThreadSubmission,
    handleExistingThreadSubmission,
    textareaRef,
  ]);

  if (!hasRequiredKeys) {
    return <KeyPrompt />;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustHeight();
  };

  return (
    <div className="fixed bottom-0 w-full max-w-3xl">
      <div className="bg-muted/50 rounded-t-[20px] p-2 pb-0 w-full backdrop-blur-lg">
        <div className="relative">
          <div className="bg-muted rounded-t-[12px] flex flex-col">
            <div className="overflow-y-auto max-h-[300px]">
              <Textarea
                id="chat-input"
                value={input}
                placeholder="What can I do for you?"
                className={cn(
                  'w-full rounded-t-[12px] px-4 py-3 bg-accent border-none text-foreground',
                  'placeholder:text-muted-foreground resize-none',
                  'focus-visible:ring-0 focus-visible:ring-offset-0',
                  'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted',
                  'hover:scrollbar-thumb-muted-foreground/50 scrollbar-thumb-rounded-full',
                  'min-h-[72px]'
                )}
                ref={textareaRef}
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
                aria-label="Chat message input"
                aria-describedby="chat-input-description"
              />
              <span id="chat-input-description" className="sr-only">
                Press Enter to send, Shift+Enter for new line
              </span>
            </div>

            <div className="h-14 bg-muted flex items-center">
              <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 h-8 pl-2 pr-2 text-xs rounded-md text-foreground hover:bg-accent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                        aria-label={`Selected model: ${selectedModel}`}
                      >
                        <div className="flex items-center gap-1">
                          {selectedModel}
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className={cn(
                        'min-w-[10rem]',
                        'border-border',
                        'bg-popover'
                      )}
                    >
                      {AI_MODELS.map((model) => (
                        <DropdownMenuItem
                          key={model}
                          onSelect={() => setModel(model)}
                          className="flex items-center justify-between gap-2"
                        >
                          <span>{model}</span>
                          {selectedModel === model && (
                            <Check
                              className="w-4 h-4 text-blue-500"
                              aria-label="Selected"
                            />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {status === 'submitted' || status === 'streaming' ? (
                  <StopButton stop={stop} />
                ) : (
                  <SendButton onSubmit={handleSubmit} disabled={isDisabled} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ChatInput = memo(PureChatInput, (prevProps, nextProps) => {
  return (
    prevProps.status === nextProps.status &&
    prevProps.input === nextProps.input &&
    prevProps.threadId === nextProps.threadId
  );
});

function PureStopButton({ stop }: StopButtonProps) {
  const handleClick = () => {
    stop();
  };

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={handleClick}
      aria-label="Stop generating response"
    >
      <StopIcon size={24} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

const PureSendButton = ({ onSubmit, disabled }: SendButtonProps) => {
  return (
    <Button
      onClick={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      variant="outline"
      size="icon"
      disabled={disabled}
      aria-label="Send message"
    >
      <ArrowUpIcon size={18} />
    </Button>
  );
};

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  return prevProps.disabled === nextProps.disabled;
});

export default ChatInput;
