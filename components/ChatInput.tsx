'use client';

import { ChevronDown, Check, ArrowUpIcon } from 'lucide-react';
import { memo, useState, useCallback } from 'react';
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
import { UIMessage } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { StopIcon } from './ui/icons';
import { toast } from 'sonner';

// Constants
const AI_MODELS = [
  'Deepseek R1 0528',
  'Gemini 2.5 Pro',
  'Gemini 2.5 Flash',
  'o3',
  'GPT-4o-mini',
  'GPT-4o',
  'Mistral Large',
] as const;

type AIModel = (typeof AI_MODELS)[number];

interface ChatInputProps {
  threadId: string;
  status: UseChatHelpers['status'];
  input: UseChatHelpers['input'];
  setInput: UseChatHelpers['setInput'];
  setMessages: UseChatHelpers['setMessages'];
  append: UseChatHelpers['append'];
  stop: UseChatHelpers['stop'];
}

interface StopButtonProps {
  stop: UseChatHelpers['stop'];
  setMessages: UseChatHelpers['setMessages'];
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
  status,
  input,
  setInput,
  setMessages,
  append,
  stop,
}: ChatInputProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 200,
  });
  const [selectedModel, setSelectedModel] = useState<AIModel>('Mistral Large');

  const navigate = useNavigate();
  const { id } = useParams();

  const { complete } = useCompletion({
    api: '/api/completion',
    onResponse: async (response) => {
      try {
        if (response.ok) {
          const { title } = await response.json();
          await updateThread(threadId, title);
        } else {
          const { error } = await response.json();
          toast.error(error || 'Failed to update thread title');
        }
      } catch (error) {
        console.error('Thread title update error:', error);
        toast.error('Failed to update thread title');
      }
    },
  });

  const handleNewThreadSubmission = useCallback(
    async (userMessage: UIMessage, inputValue: string) => {
      await createThread(threadId);
      navigate(`/chat/${threadId}`);

      await Promise.all([
        complete(inputValue),
        createMessage(threadId, userMessage),
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

  const handleSubmit = async () => {
    if (status !== 'ready' || !input.trim()) {
      return;
    }

    const value = input.trim();
    const userMessage = createUserMessage(value);

    try {
      append(userMessage);
      setInput('');
      adjustHeight(true);

      if (!id) {
        await handleNewThreadSubmission(userMessage, value);
      } else {
        await handleExistingThreadSubmission(userMessage);
      }
    } catch (error) {
      console.error('Failed to submit message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      adjustHeight();
    },
    [setInput, adjustHeight]
  );

  const isDisabled = !input.trim() || status !== 'ready';

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
                          onSelect={() => setSelectedModel(model)}
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
                  <StopButton stop={stop} setMessages={setMessages} />
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

function PureStopButton({ stop, setMessages }: StopButtonProps) {
  const handleClick = useCallback(() => {
    stop();
    setMessages((messages) => messages);
  }, [stop, setMessages]);

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
      onClick={onSubmit}
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
