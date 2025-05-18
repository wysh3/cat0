import Message from './Message';
import { UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import { memo } from 'react';

function PureMessages({ messages }: { messages: UIMessage[] }) {
  return (
    <section className="flex flex-col gap-10">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </section>
  );
}

const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  return true;
});

Messages.displayName = 'Messages';

export default Messages;
