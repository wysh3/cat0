import { db } from './db';
import { UIMessage } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import Dexie from 'dexie';

// Error handling types
export interface DatabaseError {
  type: 'storage_quota' | 'database_blocked' | 'database_corrupt' | 'unknown';
  message: string;
  originalError: Error;
}

// Error handler utility
const handleDatabaseError = (error: any): DatabaseError => {
  if (error.name === 'QuotaExceededError') {
    return {
      type: 'storage_quota',
      message: 'Storage quota exceeded. Please clear some chat history.',
      originalError: error,
    };
  }
  
  if (error.name === 'BlockedError') {
    return {
      type: 'database_blocked',
      message: 'Database access blocked. Please check browser settings.',
      originalError: error,
    };
  }
  
  if (error.name === 'DatabaseClosedError' || error.name === 'InvalidStateError') {
    return {
      type: 'database_corrupt',
      message: 'Database corrupted. You may need to clear browser data.',
      originalError: error,
    };
  }
  
  return {
    type: 'unknown',
    message: 'An unexpected database error occurred.',
    originalError: error,
  };
};

// Wrapper for database operations with error handling
const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<{ data?: T; error?: DatabaseError }> => {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('Database operation failed:', dbError);
    
    if (fallback !== undefined) {
      return { data: fallback, error: dbError };
    }
    
    return { error: dbError };
  }
};

export const getThreads = async () => {
  return withErrorHandling(
    () => db.threads.orderBy('lastMessageAt').reverse().toArray(),
    [] // Fallback to empty array if operation fails
  );
};

export const createThread = async (id: string) => {
  return withErrorHandling(() =>
    db.threads.add({
      id,
      title: 'New Chat',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessageAt: new Date(),
    })
  );
};

export const updateThread = async (id: string, title: string) => {
  return withErrorHandling(() =>
    db.threads.update(id, {
      title,
      updatedAt: new Date(),
    })
  );
};

export const deleteThread = async (id: string) => {
  return withErrorHandling(() =>
    db.transaction(
      'rw',
      [db.threads, db.messages, db.messageSummaries],
      async () => {
        await db.messages.where('threadId').equals(id).delete();
        await db.messageSummaries.where('threadId').equals(id).delete();
        return await db.threads.delete(id);
      }
    )
  );
};

export const deleteAllThreads = async () => {
  return withErrorHandling(() =>
    db.transaction(
      'rw',
      [db.threads, db.messages, db.messageSummaries],
      async () => {
        await db.threads.clear();
        await db.messages.clear();
        await db.messageSummaries.clear();
      }
    )
  );
};

export const getMessagesByThreadId = async (threadId: string) => {
  return withErrorHandling(
    () =>
      db.messages
        .where('[threadId+createdAt]')
        .between([threadId, Dexie.minKey], [threadId, Dexie.maxKey])
        .toArray(),
    [] // Fallback to empty array if operation fails
  );
};

export const createMessage = async (threadId: string, message: UIMessage) => {
  return withErrorHandling(() =>
    db.transaction('rw', [db.messages, db.threads], async () => {
      await db.messages.add({
        id: message.id,
        threadId,
        parts: message.parts,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt || new Date(),
      });

      await db.threads.update(threadId, {
        lastMessageAt: message.createdAt || new Date(),
      });
    })
  );
};

export const deleteTrailingMessages = async (
  threadId: string,
  createdAt: Date,
  gte: boolean = true
) => {
  const startKey = gte
    ? [threadId, createdAt]
    : [threadId, new Date(createdAt.getTime() + 1)];
  const endKey = [threadId, Dexie.maxKey];

  return withErrorHandling(() =>
    db.transaction(
      'rw',
      [db.messages, db.messageSummaries],
      async () => {
        const messagesToDelete = await db.messages
          .where('[threadId+createdAt]')
          .between(startKey, endKey)
          .toArray();

        const messageIds = messagesToDelete.map((msg) => msg.id);

        await db.messages
          .where('[threadId+createdAt]')
          .between(startKey, endKey)
          .delete();

        if (messageIds.length > 0) {
          await db.messageSummaries.where('messageId').anyOf(messageIds).delete();
        }
      }
    )
  );
};

export const createMessageSummary = async (
  threadId: string,
  messageId: string,
  content: string
) => {
  return withErrorHandling(() =>
    db.messageSummaries.add({
      id: uuidv4(),
      threadId,
      messageId,
      content,
      createdAt: new Date(),
    })
  );
};

export const getMessageSummaries = async (threadId: string) => {
  return withErrorHandling(
    () =>
      db.messageSummaries
        .where('[threadId+createdAt]')
        .between([threadId, Dexie.minKey], [threadId, Dexie.maxKey])
        .toArray(),
    [] // Fallback to empty array if operation fails
  );
};
