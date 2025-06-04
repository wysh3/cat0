import { useChat } from '@ai-sdk/react';
import Messages from './Messages';
import ChatInput from './ChatInput';
import { UIMessage } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { createMessage } from '@/frontend/dexie/queries';
import { useAPIKeysStore } from '@/frontend/stores/APIKeysStore';
import { useModelStore } from '@/frontend/stores/ModelStore';

interface ChatProps {
  threadId: string;
  initialMessages: UIMessage[];
}

export default function Chat({ threadId, initialMessages }: ChatProps) {
  const { getKey } = useAPIKeysStore();
  const selectedModel = useModelStore((state) => state.selectedModel);
  const modelConfig = useModelStore((state) => state.getModelConfig());

  const {
    messages,
    input,
    status,
    setInput,
    setMessages,
    append,
    stop,
    reload,
  } = useChat({
    id: threadId,
    initialMessages,
    experimental_throttle: 50,
    onFinish: async ({ parts }) => {
      const aiMessage: UIMessage = {
        id: uuidv4(),
        parts: parts as UIMessage['parts'],
        role: 'assistant',
        content: '',
      };

      try {
        await createMessage(threadId, aiMessage);
      } catch (error) {
        console.error(error);
        // TODO - Handle Dexie Related Errors here
      }
    },
    headers: {
      [modelConfig.headerKey]: getKey(modelConfig.provider) || '',
    },
    body: {
      model: selectedModel,
    },
  });

  return (
    <main className="flex flex-col w-full max-w-3xl pt-10 pb-44 mx-auto">
      <Messages
        threadId={threadId}
        messages={messages}
        status={status}
        setMessages={setMessages}
        reload={reload}
      />
      <ChatInput
        append={append}
        threadId={threadId}
        setInput={setInput}
        input={input}
        status={status}
        stop={stop}
      />
    </main>
  );
}
