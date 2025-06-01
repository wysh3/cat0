import { useState } from 'react';
import MemoizedMarkdown from './MemoizedMarkdown';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

export default function MessageReasoning({
  reasoning,
  id,
}: {
  reasoning: string;
  id: string;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex flex-col gap-2 pb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-muted-foreground"
      >
        {isExpanded ? (
          <span>
            <ChevronDownIcon className="w-4 h-4" />
          </span>
        ) : (
          <span>
            <ChevronUpIcon className="w-4 h-4" />
          </span>
        )}
        Reasoning
      </button>
      {isExpanded && (
        <div className="p-4 rounded-md bg-muted text-xs">
          <MemoizedMarkdown content={reasoning} id={id} />
        </div>
      )}
    </div>
  );
}
