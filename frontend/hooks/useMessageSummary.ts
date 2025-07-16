import { useCompletion } from '@ai-sdk/react';
import { useAPIKeyStore } from '@/frontend/stores/APIKeyStore';
import { useModelStore } from '@/frontend/stores/ModelStore';
import { toast } from 'sonner';
import { createMessageSummary, updateThread } from '@/frontend/dexie/queries';
import { getModelConfig } from '@/lib/models';

interface MessageSummaryPayload {
  title: string;
  isTitle?: boolean;
  messageId: string;
  threadId: string;
}

interface ErrorPayload {
  error: string;
}

export const useMessageSummary = () => {
  const getKey = useAPIKeyStore((state) => state.getKey);
  const { selectedModel } = useModelStore();

  const modelConfig = getModelConfig(selectedModel);
  const apiKey = getKey(modelConfig.provider);

  const { complete, isLoading } = useCompletion({
    api: '/api/completion',
    ...(apiKey && {
      headers: { [modelConfig.headerKey]: apiKey },
    }),
    onResponse: async (response) => {
      try {
        if (response.ok) {
          const payload: MessageSummaryPayload = await response.json();
          const { title, isTitle, messageId, threadId } = payload;

          if (isTitle) {
            const updateResult = await updateThread(threadId, title);
            if (updateResult.error) {
              console.error('Failed to update thread title:', updateResult.error);
              toast.error(`Failed to update chat title: ${updateResult.error.message}`);
              return;
            }
            
            const summaryResult = await createMessageSummary(threadId, messageId, title);
            if (summaryResult.error) {
              console.error('Failed to create message summary:', summaryResult.error);
              toast.error(`Failed to save summary: ${summaryResult.error.message}`);
            }
          } else {
            const summaryResult = await createMessageSummary(threadId, messageId, title);
            if (summaryResult.error) {
              console.error('Failed to create message summary:', summaryResult.error);
              toast.error(`Failed to save summary: ${summaryResult.error.message}`);
            }
          }
        } else {
          const errorPayload: ErrorPayload = await response.json();
          toast.error(errorPayload.error || 'Failed to generate a summary for the message');
        }
      } catch (error) {
        console.error(error);
        toast.error('An unexpected error occurred while processing the summary');
      }
    },
  });

  const completeWithModel = (prompt: string, options: any = {}) => {
    return complete(prompt, {
      ...options,
      body: {
        ...options.body,
        model: selectedModel,
      },
    });
  };

  return {
    complete: completeWithModel,
    isLoading,
  };
};
