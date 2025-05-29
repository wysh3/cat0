import { UIMessage } from 'ai';
import Dexie, { type EntityTable } from 'dexie';

interface Thread {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DBMessage {
  id: string;
  threadId: string;
  parts: UIMessage['parts'];
  role: 'user' | 'assistant' | 'system' | 'data';
  createdAt: Date;
}

const db = new Dexie('satori') as Dexie & {
  threads: EntityTable<Thread, 'id'>;
  messages: EntityTable<DBMessage, 'id'>;
};

db.version(1).stores({
  threads: 'id, title, updatedAt',
  messages: 'id, threadId, createdAt',
});

export type { Thread, DBMessage };
export { db };
