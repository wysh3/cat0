import Dexie, { type EntityTable } from 'dexie';

interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: string;
  chatId: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
  updatedAt: Date;
}

const db = new Dexie('satori') as Dexie & {
  chats: EntityTable<Chat, 'id'>;
  messages: EntityTable<Message, 'id'>;
};

db.version(1).stores({
  chats: 'id, title, updatedAt',
  messages: 'id, chatId, updatedAt',
});

export type { Chat, Message };
export { db };
