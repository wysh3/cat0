import { UIMessage } from 'ai';
import { db } from './db';

export const getThreads = async () => {
  return await db.threads.orderBy('updatedAt').reverse().toArray();
};

export const createThread = async (id: string) => {
  return await db.threads.add({
    id,
    title: 'New Chat',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const updateThread = async (id: string, title: string) => {
  return await db.threads.update(id, {
    title,
    updatedAt: new Date(),
  });
};

export const deleteThread = async (id: string) => {
  return await db.transaction('rw', [db.threads, db.messages], async () => {
    await db.messages.where('threadId').equals(id).delete();
    return await db.threads.delete(id);
  });
};

export const deleteAllThreads = async () => {
  await db.threads.clear();
  await db.messages.clear();
  return;
};

export const getMessages = async (threadId: string) => {
  return await db.messages
    .orderBy('createdAt')
    .filter((message) => message.threadId === threadId)
    .toArray();
};

export const createMessage = async (threadId: string, message: UIMessage) => {
  return await db.messages.add({
    id: message.id,
    threadId,
    parts: message.parts,
    role: message.role,
    createdAt: message.createdAt || new Date(),
  });
};

export const deleteTrailingMessages = async (
  threadId: string,
  createdAt: Date,
  gte: boolean = true
) => {
  if (gte) {
    await db.messages
      .where('threadId')
      .equals(threadId)
      .filter((message) => message.createdAt >= createdAt)
      .delete();
  } else {
    await db.messages
      .where('threadId')
      .equals(threadId)
      .filter((message) => message.createdAt > createdAt)
      .delete();
  }
};
