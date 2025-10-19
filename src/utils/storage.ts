// Chat storage utilities
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  avatarId?: string;
  avatarName?: string;
}

export const getChats = (userId: string): Chat[] => {
  const chatsStr = localStorage.getItem(`multiAiHub_chats_${userId}`);
  return chatsStr ? JSON.parse(chatsStr) : [];
};

export const saveChat = (userId: string, chat: Chat): void => {
  const chats = getChats(userId);
  const index = chats.findIndex(c => c.id === chat.id);
  
  if (index !== -1) {
    chats[index] = chat;
  } else {
    chats.push(chat);
  }
  
  localStorage.setItem(`multiAiHub_chats_${userId}`, JSON.stringify(chats));
};

export const deleteChat = (userId: string, chatId: string): void => {
  const chats = getChats(userId);
  const filtered = chats.filter(c => c.id !== chatId);
  localStorage.setItem(`multiAiHub_chats_${userId}`, JSON.stringify(filtered));
};

export const createNewChat = (userId: string): Chat => {
  const newChat: Chat = {
    id: crypto.randomUUID(),
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  saveChat(userId, newChat);
  return newChat;
};
