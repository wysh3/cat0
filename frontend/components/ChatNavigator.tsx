import { useLiveQuery } from 'dexie-react-hooks';
import { getMessageSummaries } from '@/frontend/dexie/queries';
import { memo } from 'react';

interface MessageNavigatorProps {
  threadId: string;
  scrollToMessage: (id: string) => void;
}

function PureChatNavigator({
  threadId,
  scrollToMessage,
}: MessageNavigatorProps) {
  const messageSummaries = useLiveQuery(
    () => getMessageSummaries(threadId),
    [threadId]
  );

  return (
    <aside className="fixed right-8 top-20 w-80 z-10">
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4">
        <h3 className="text-sm text-muted-foreground mb-2 text-center">
          Message Navigator
        </h3>
        <ul className="flex flex-col gap-2 prose prose-sm dark:prose-invert list-disc pl-5 w-full h-[calc(100vh-200px)] overflow-hidden overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/30 scrollbar-thumb-rounded-full">
          {messageSummaries?.map((summary) => (
            <li
              key={summary.id}
              onClick={() => scrollToMessage(summary.messageId)}
              className="cursor-pointer hover:text-foreground transition-colors"
            >
              {summary.content}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default memo(PureChatNavigator, (prevProps, nextProps) => {
  return prevProps.threadId === nextProps.threadId;
});
