import { Status } from '@/lib/types';
import PreviewMessage from './Message';
import { ChatRequestOptions, UIMessage, type Message } from 'ai';
import equal from 'fast-deep-equal';
import { memo } from 'react';

function PureMessages({
  messages,
  status,
  setMessages,
  reload,
}: {
  messages: UIMessage[];
  setMessages: (messages: Message[]) => void;
  status: Status;
  reload: (chatRequestOptions?: ChatRequestOptions) => void;
}) {
  return (
    <section className="flex flex-col gap-12">
      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          message={message}
          isLoading={status === 'streaming' && messages.length - 1 === index}
        />
      ))}
    </section>
  );
}

const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (prevProps.status !== nextProps.status) return false;
  return true;
});

Messages.displayName = 'Messages';

export default Messages;
