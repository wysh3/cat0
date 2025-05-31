'use client';

import { ArrowRight, ChevronDown, Paperclip, Check } from 'lucide-react';
import { memo, useState } from 'react';
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
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 200,
  });
  const [selectedModel, setSelectedModel] = useState('Mistral Large');

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

  const handleSubmit = async () => {
    if (status !== 'ready') {
      return;
    }

    const value = input.trim();

    const userMessage = createUserMessage(value);

    try {
      append(userMessage);
      setInput('');

      if (!id) {
        await handleNewThreadSubmission(userMessage, value);
      } else {
        await handleExistingThreadSubmission(userMessage);
      }
    } catch (error) {
      console.error('Failed to submit message:', error);
      // TODO: show user-facing error message here
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const createUserMessage = (text: string): UIMessage => ({
    id: uuidv4(),
    parts: [{ type: 'text', text }],
    role: 'user',
    content: '',
  });

  const handleNewThreadSubmission = async (
    userMessage: UIMessage,
    inputValue: string
  ) => {
    try {
      await createThread(threadId);
      navigate(`/chat/${threadId}`);

      await Promise.all([
        complete(inputValue),
        createMessage(threadId, userMessage),
      ]);
    } catch (error) {
      console.error('Failed to create new thread:', error);
      throw error;
    }
  };

  const handleExistingThreadSubmission = async (userMessage: UIMessage) => {
    try {
      await createMessage(threadId, userMessage);
    } catch (error) {
      console.error('Failed to save message to existing thread:', error);
      throw error;
    }
  };

  const AI_MODELS = [
    'Gemini 2.5 Flash',
    'Gemini 2.5 Pro',
    'Deepseek R1 0528',
    'Mistral Large',
  ];

  return (
    <div className="fixed bottom-0 w-full max-w-3xl">
      <div className="bg-muted/80 rounded-2xl p-2 w-full">
        <div className="relative">
          <div className="bg-muted relative flex flex-col rounded-2xl">
            <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
              <Textarea
                id="ai-input-15"
                value={input}
                placeholder={'What can I do for you?'}
                className={cn(
                  'w-full rounded-xl rounded-b-none px-4 py-3 bg-muted border-none text-foreground placeholder:text-muted-foreground resize-none focus-visible:ring-0 focus-visible:ring-offset-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted hover:scrollbar-thumb-muted-foreground/50 scrollbar-thumb-rounded-full',
                  'min-h-[72px]'
                )}
                ref={textareaRef}
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustHeight();
                }}
              />
            </div>

            <div className="h-14 bg-muted rounded-b-xl flex items-center">
              <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 h-8 pl-2 pr-2 text-xs rounded-md text-foreground hover:bg-accent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
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
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="h-4 w-px bg-border mx-0.5" />
                  {/* TODO: Add file attachment */}
                  {/* <label
                    className={cn(
                      'rounded-lg p-2 bg-muted cursor-pointer',
                      'hover:bg-accent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500',
                      'text-muted-foreground hover:text-foreground'
                    )}
                    aria-label="Attach file"
                  >
                    <input type="file" className="hidden" />
                    <Paperclip className="w-4 h-4 transition-colors" />
                  </label> */}
                </div>

                <button
                  type="button"
                  className={cn(
                    'rounded-lg p-2 bg-muted',
                    'hover:bg-accent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500'
                  )}
                  aria-label="Send message"
                  disabled={!input.trim()}
                  onClick={() => {
                    if (!input.trim()) return;
                    setInput('');
                    adjustHeight(true);
                    handleSubmit();
                  }}
                >
                  <ArrowRight
                    className={cn(
                      'w-4 h-4 text-foreground transition-opacity duration-200',
                      input.trim() ? 'opacity-100' : 'opacity-30'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
