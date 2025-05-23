import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

const createChat = async (title: string) => {
  return await db.chats.add({
    id: uuidv4(),
    title,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

const getChats = async () => {
  return await db.chats.orderBy('updatedAt').reverse().toArray();
};

const updateChatTitle = async (id: string, title: string) => {
  const chat = await db.chats.get(id);
  if (!chat) {
    throw new Error(`Chat with id ${id} not found`);
  }

  return await db.chats.update(id, { title, updatedAt: new Date() });
};

const deleteChat = async (id: string) => {
  const chat = await db.chats.get(id);
  if (!chat) {
    throw new Error(`Chat with id ${id} not found`);
  }

  return await db.transaction('rw', [db.chats, db.messages], async () => {
    await db.messages.where('chatId').equals(id).delete();
    return await db.chats.delete(id);
  });
};

export { createChat, getChats, updateChatTitle, deleteChat };
