import { ChevronDown, Check, ArrowUpIcon } from 'lucide-react';
import { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { Textarea } from '@/frontend/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Button } from '@/frontend/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/frontend/components/ui/dropdown-menu';
import useAutoResizeTextarea from '@/hooks/useAutoResizeTextArea';
import { UseChatHelpers } from '@ai-sdk/react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router';
import { createMessage, createThread } from '@/frontend/dexie/queries';
import { useAPIKeyStore } from '@/frontend/stores/APIKeyStore';
import { useModelStore } from '@/frontend/stores/ModelStore';
import { AI_MODELS, AIModel, getModelConfig } from '@/lib/models';
import KeyPrompt from '@/frontend/components/KeyPrompt';
import { UIMessage } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { StopIcon } from './ui/icons';
import { toast } from 'sonner';
import { useMessageSummary } from '../hooks/useMessageSummary';

interface ChatInputProps {
  threadId: string;
  input: UseChatHelpers['input'];
  status: UseChatHelpers['status'];
  setInput: UseChatHelpers['setInput'];
  append: UseChatHelpers['append'];
  stop: UseChatHelpers['stop'];
  onScrollToBottom?: () => void;
}

interface StopButtonProps {
  stop: UseChatHelpers['stop'];
}

interface SendButtonProps {
  onSubmit: () => void;
  disabled: boolean;
}

const createUserMessage = (id: string, text: string): UIMessage => ({
  id,
  parts: [{ type: 'text', text }],
  role: 'user',
  content: text,
  createdAt: new Date(),
});

function PureChatInput({
  threadId,
  input,
  status,
  setInput,
  append,
  stop,
  onScrollToBottom,
}: ChatInputProps) {
  const canChat = useAPIKeyStore((state) => state.hasRequiredKeys());

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 200,
  });

  const navigate = useNavigate();
  const { id } = useParams();

  const isDisabled = useMemo(
    () => !input.trim() || status === 'streaming' || status === 'submitted',
    [input, status]
  );

  const { complete } = useMessageSummary();

  // Scroll button state
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
  const [isScrollButtonPressed, setIsScrollButtonPressed] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight;
          const clientHeight = document.documentElement.clientHeight;

          // Show button when user has scrolled up from the bottom (with more generous threshold)
          const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200;
          setIsScrollButtonVisible(!isNearBottom && scrollHeight > clientHeight);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollButtonClick = () => {
    if (onScrollToBottom) {
      setIsScrollButtonPressed(true);
      onScrollToBottom();
      // Reset pressed state after animation - snappier timing
      setTimeout(() => setIsScrollButtonPressed(false), 100);
    }
  };

  const handleSubmit = useCallback(async () => {
    const currentInput = textareaRef.current?.value || input;

    if (
      !currentInput.trim() ||
      status === 'streaming' ||
      status === 'submitted'
    )
      return;

    const messageId = uuidv4();

    try {
      if (!id) {
        navigate(`/chat/${threadId}`);

        const threadResult = await createThread(threadId);
        if (threadResult.error) {
          toast.error(`Failed to create chat: ${threadResult.error.message}`);
          return;
        }

        complete(currentInput.trim(), {
          body: { threadId, messageId, isTitle: true },
        });
      } else {
        complete(currentInput.trim(), { body: { messageId, threadId } });
      }

      const userMessage = createUserMessage(messageId, currentInput.trim());
      const messageResult = await createMessage(threadId, userMessage);

      if (messageResult.error) {
        toast.error(`Failed to save message: ${messageResult.error.message}`);
        return;
      }

      append(userMessage);
      setInput('');
      adjustHeight(true);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('An unexpected error occurred while sending your message');
    }
  }, [
    input,
    status,
    setInput,
    adjustHeight,
    append,
    id,
    textareaRef,
    threadId,
    complete,
  ]);

  if (!canChat) {
    return <KeyPrompt />;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
      {/* Scroll to bottom button - positioned above the chat input */}
      <Button
        onClick={handleScrollButtonClick}
        variant="outline"
        size="icon"
        className={cn(
          // Position above chat input, right-aligned - moved down and more to the right, smaller size
          'absolute -top-12 right-2 z-50 rounded-full size-8',
          // Grok-inspired styling
          'bg-background/95 backdrop-blur-md border border-border/60',
          'shadow-lg shadow-black/10 dark:shadow-black/30',
          // Snappy transitions
          'transition-all duration-150 ease-out',
          // Hover effects
          'hover:bg-accent/80 hover:border-border hover:shadow-xl hover:shadow-black/15',
          'hover:scale-110 hover:-translate-y-0.5',
          'dark:hover:shadow-black/40',
          // Focus states
          'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
          'focus-visible:ring-offset-background',
          // Active/pressed state
          isScrollButtonPressed && 'scale-95 shadow-md',
          // Visibility animation with smooth fade
          isScrollButtonVisible
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
            : 'opacity-0 translate-y-2 pointer-events-none scale-95'
        )}
        aria-label="Scroll to bottom"
        aria-hidden={!isScrollButtonVisible}
      >
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-100',
            isScrollButtonPressed && 'scale-90',
            'text-foreground/80'
          )}
        />
      </Button>

      <div className="bg-secondary rounded-t-[20px] p-2 pb-0 w-full relative">
        <div className="relative">
          <div className="flex flex-col">
            <div className="bg-secondary overflow-y-auto max-h-[300px]">
              <Textarea
                id="chat-input"
                value={input}
                placeholder="What can I do for you?"
                className={cn(
                  'w-full px-4 py-3 border-none shadow-none dark:bg-transparent',
                  'placeholder:text-muted-foreground resize-none',
                  'focus-visible:ring-0 focus-visible:ring-offset-0',
                  'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/30',
                  'scrollbar-thumb-rounded-full',
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

            <div className="h-14 flex items-center px-2">
              <div className="flex items-center justify-between w-full">
                <ChatModelDropdown />

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
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.status !== nextProps.status) return false;
  return true;
});

const PureChatModelDropdown = () => {
  const getKey = useAPIKeyStore((state) => state.getKey);
  const { selectedModel, setModel } = useModelStore();

  const isModelEnabled = useCallback(
    (model: AIModel) => {
      const modelConfig = getModelConfig(model);
      const apiKey = getKey(modelConfig.provider);
      return !!apiKey;
    },
    [getKey]
  );

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-1 h-8 pl-2 pr-2 text-xs rounded-md text-foreground hover:bg-primary/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
            aria-label={`Selected model: ${selectedModel}`}
          >
            <div className="flex items-center gap-1">
              {selectedModel}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn('min-w-[10rem]', 'border-border', 'bg-popover')}
        >
          {AI_MODELS.map((model) => {
            const isEnabled = isModelEnabled(model);
            return (
              <DropdownMenuItem
                key={model}
                onSelect={() => isEnabled && setModel(model)}
                disabled={!isEnabled}
                className={cn(
                  'flex items-center justify-between gap-2',
                  'cursor-pointer'
                )}
              >
                <span>{model}</span>
                {selectedModel === model && (
                  <Check
                    className="w-4 h-4 text-blue-500"
                    aria-label="Selected"
                  />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const ChatModelDropdown = memo(PureChatModelDropdown);

function PureStopButton({ stop }: StopButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={stop}
      aria-label="Stop generating response"
    >
      <StopIcon size={20} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

const PureSendButton = ({ onSubmit, disabled }: SendButtonProps) => {
  return (
    <Button
      onClick={onSubmit}
      variant="default"
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
