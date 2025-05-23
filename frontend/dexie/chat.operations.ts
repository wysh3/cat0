import { db } from './db';

const createChat = async (title: string) => {
  const chat = await db.chats.add({
    title,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return chat;
};

const getChats = async () => {
  return await db.chats.orderBy('updatedAt').reverse().toArray();
};

const updateChat = async (id: string, title: string) => {
  return await db.chats.update(id, { title, updatedAt: new Date() });
};

const deleteChat = async (id: string) => {
  return await db.chats.delete(id);
};

export { createChat, getChats, updateChat, deleteChat };
