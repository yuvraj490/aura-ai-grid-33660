// Authentication utilities using localStorage
export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'premium' | 'annual';
  avatar?: string;
  promptsUsed: number;
  promptsLimit: number;
  lastReset: string;
  createdAt: string;
}

export const ADMIN_EMAIL = 'ys8800221@gmail.com';

export const isAdmin = (email: string): boolean => {
  return email === ADMIN_EMAIL;
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('multiAiHub_user');
  if (!userStr) return null;
  
  const user = JSON.parse(userStr) as User;
  
  // Reset prompts if it's a new day
  const lastReset = new Date(user.lastReset);
  const now = new Date();
  if (now.toDateString() !== lastReset.toDateString()) {
    user.promptsUsed = 0;
    user.lastReset = now.toISOString();
    saveUser(user);
  }
  
  return user;
};

export const saveUser = (user: User): void => {
  localStorage.setItem('multiAiHub_user', JSON.stringify(user));
};

export const login = (email: string, password: string): User | null => {
  const users = getAllUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) return null;
  
  // In real app, verify password hash
  localStorage.setItem('multiAiHub_currentUser', email);
  return user;
};

export const signup = (name: string, email: string, password: string): User => {
  const users = getAllUsers();
  
  if (users.find(u => u.email === email)) {
    throw new Error('Email already exists');
  }
  
  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
    plan: 'free',
    promptsUsed: 0,
    promptsLimit: 10,
    lastReset: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  localStorage.setItem('multiAiHub_users', JSON.stringify(users));
  localStorage.setItem('multiAiHub_currentUser', email);
  
  return newUser;
};

export const logout = (): void => {
  localStorage.removeItem('multiAiHub_currentUser');
};

export const getCurrentUser = (): User | null => {
  const currentEmail = localStorage.getItem('multiAiHub_currentUser');
  if (!currentEmail) return null;
  
  const users = getAllUsers();
  const user = users.find(u => u.email === currentEmail);
  
  if (!user) return null;
  
  // Reset prompts if it's a new day
  const lastReset = new Date(user.lastReset);
  const now = new Date();
  if (now.toDateString() !== lastReset.toDateString()) {
    user.promptsUsed = 0;
    user.lastReset = now.toISOString();
    updateUser(user);
  }
  
  return user;
};

export const updateUser = (updatedUser: User): void => {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem('multiAiHub_users', JSON.stringify(users));
  }
};

export const getAllUsers = (): User[] => {
  const usersStr = localStorage.getItem('multiAiHub_users');
  return usersStr ? JSON.parse(usersStr) : [];
};

export const incrementPromptUsage = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admin and premium users have unlimited prompts
  if (isAdmin(user.email) || user.plan === 'premium' || user.plan === 'annual') {
    return true;
  }
  
  if (user.promptsUsed >= user.promptsLimit) {
    return false;
  }
  
  user.promptsUsed += 1;
  updateUser(user);
  return true;
};

export const getRemainingPrompts = (): number => {
  const user = getCurrentUser();
  if (!user) return 0;
  
  if (isAdmin(user.email) || user.plan === 'premium' || user.plan === 'annual') {
    return Infinity;
  }
  
  return Math.max(0, user.promptsLimit - user.promptsUsed);
};
