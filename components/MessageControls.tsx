import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Check, Copy, SquarePen } from 'lucide-react';

export default function MessageControls({
  content,
  role,
  setMode,
}: {
  content: string;
  role: 'data' | 'system' | 'user' | 'assistant';
  setMode?: Dispatch<SetStateAction<'view' | 'edit'>>;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div
      className={cn(
        'opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex gap-2"',
        {
          'absolute mt-5 right-2': role === 'user',
        }
      )}
    >
      <Button variant="ghost" size="icon" onClick={handleCopy}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
      {setMode && (
        <Button variant="ghost" size="icon" onClick={() => setMode('edit')}>
          <SquarePen className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
