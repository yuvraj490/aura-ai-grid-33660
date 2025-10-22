import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, Plus, Search, Pin, Trash2, Settings, MessageSquare, 
  Sparkles, User, Bot, Copy, RefreshCw, Square, Loader2, 
  Paperclip, X, FileText, Globe, BookOpen, Code, Briefcase
} from 'lucide-react';
import { Chat, Message, getChats, saveChat, createNewChat, deleteChat } from '@/utils/storage';
import { incrementPromptUsage, getRemainingPrompts } from '@/utils/auth';
import { supabase } from '@/integrations/supabase/client';

// Memoized chat item component
const ChatItem = memo(({ 
  chat, 
  isActive, 
  onSelect, 
  onDelete 
}: { 
  chat: Chat; 
  isActive: boolean; 
  onSelect: (chat: Chat) => void; 
  onDelete: (chatId: string) => void;
}) => {
  const handleClick = useCallback(() => {
    onSelect(chat);
  }, [chat, onSelect]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(chat.id);
  }, [chat.id, onDelete]);

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
        isActive
          ? 'bg-primary/10 border border-primary/20'
          : 'hover:bg-muted/50 border border-transparent'
      }`}
    >
      <div className="flex items-start gap-2">
        {chat.avatarId ? (
          <User className="h-4 w-4 mt-1 shrink-0 text-primary" />
        ) : (
          <MessageSquare className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{chat.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {chat.avatarName && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {chat.avatarName}
              </Badge>
            )}
            <p className="text-xs text-muted-foreground">
              {chat.messages.length} msgs
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-destructive/10 rounded"
          aria-label="Delete chat"
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
    </button>
  );
});

ChatItem.displayName = 'ChatItem';

export default function Dashboard() {
  const { profile, isAuthenticated, refreshUser } = useSupabaseAuth();
  const user = profile;
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [autoAI, setAutoAI] = useState(true);
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-flash');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('general');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user) {
      const userChats = getChats(user.id);
      setChats(userChats);
      
      if (userChats.length > 0 && !activeChat) {
        setActiveChat(userChats[0]);
      } else if (userChats.length === 0) {
        const newChat = createNewChat(user.id);
        setChats([newChat]);
        setActiveChat(newChat);
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Handle avatar selection from Avatars page
  useEffect(() => {
    if (location.state?.avatar && location.state?.createNewChat && user) {
      const avatar = location.state.avatar;
      const newChat = createNewChat(user.id);
      newChat.title = `Chat with ${avatar.name}`;
      newChat.avatarId = avatar.id;
      newChat.avatarName = avatar.name;
      
      saveChat(user.id, newChat);
      setChats([newChat, ...chats]);
      setActiveChat(newChat);
      
      // Clear navigation state
      window.history.replaceState({}, document.title);
      
      toast({ title: `Started chat with ${avatar.name}` });
    }
  }, [location.state, user]);

  useEffect(() => {
    if (activeChat?.messages && activeChat.messages.length > 0) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeChat?.messages.length]);

  const handleNewChat = useCallback(() => {
    if (!user) return;
    const newChat = createNewChat(user.id);
    // New chat clears avatar mode
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
    toast({ title: 'New chat created' });
  }, [user, toast]);

  const handleDeleteChat = useCallback((chatId: string) => {
    if (!user) return;
    deleteChat(user.id, chatId);
    setChats(prev => {
      const updatedChats = prev.filter(c => c.id !== chatId);
      if (activeChat?.id === chatId) {
        setActiveChat(updatedChats[0] || null);
      }
      return updatedChats;
    });
    toast({ title: 'Chat deleted' });
  }, [user, activeChat?.id, toast]);

  const callAIAPI = async (messages: Array<{role: string; content: string}>, avatarId?: string, model?: string, mode?: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { messages, avatarId, model, mode }
    });

    if (error) {
      console.error('AI API error:', error);
      throw new Error(error.message || 'Failed to get AI response');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    return content;
  };

  const aiModels = [
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
    { id: 'openai/gpt-5', name: 'GPT-5' },
    { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini' },
    { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano' },
  ];


  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || !activeChat) return;

    // Check rate limit
    if (!incrementPromptUsage()) {
      toast({
        title: 'Rate limit reached',
        description: 'You have used all your prompts for today. Upgrade to Premium for unlimited access.',
        variant: 'destructive',
      });
      refreshUser();
      return;
    }

    let messageContent = inputValue;
    
    // Read file contents if attached
    if (attachedFiles.length > 0) {
      const fileContents = await Promise.all(
        attachedFiles.map(async (file) => {
          const text = await file.text();
          return `\n\n[File: ${file.name}]\n${text}`;
        })
      );
      messageContent += fileContents.join('');
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, userMessage],
      updatedAt: new Date().toISOString(),
      title: activeChat.messages.length === 0 ? inputValue.slice(0, 50) : activeChat.title,
    };

    // Batch state updates
    setActiveChat(updatedChat);
    setChats(prev => prev.map(c => c.id === updatedChat.id ? updatedChat : c));
    setInputValue('');
    setAttachedFiles([]);
    setIsStreaming(true);
    
    saveChat(user.id, updatedChat);
    refreshUser();

    try {
      // Build conversation history
      const conversationMessages = updatedChat.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call AI API with selected model and mode
      const modelToUse = autoAI ? undefined : selectedModel;
      const response = await callAIAPI(conversationMessages, activeChat?.avatarId, modelToUse, selectedMode);
      
      const modelName = autoAI 
        ? 'Auto AI' 
        : aiModels.find(m => m.id === selectedModel)?.name || selectedModel;
      
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        model: modelName,
        timestamp: new Date().toISOString(),
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage],
        updatedAt: new Date().toISOString(),
      };

      // Batch state updates
      setActiveChat(finalChat);
      setChats(prev => prev.map(c => c.id === finalChat.id ? finalChat : c));
      
      saveChat(user.id, finalChat);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard' });
  };

  const remainingPrompts = getRemainingPrompts();
  const promptUsagePercent = user ? (user.prompts_used / user.prompts_limit) * 100 : 0;

  const filteredChats = useMemo(() => 
    chats.filter(chat =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    ), [chats, searchQuery]
  );

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Separate Scroll */}
        <aside className="w-80 border-r border-border/50 bg-card/30 flex flex-col overflow-hidden">
          {/* User Profile */}
          <div className="p-4 border-b border-border/50 flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center relative">
                <User className="h-6 w-6 text-primary" />
                {user && (user.plan === 'free') && (
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-transparent"
                    style={{
                      borderTopColor: 'hsl(var(--primary))',
                      borderRightColor: promptUsagePercent > 50 ? 'hsl(var(--primary))' : 'transparent',
                      borderBottomColor: promptUsagePercent > 75 ? 'hsl(var(--primary))' : 'transparent',
                      borderLeftColor: promptUsagePercent > 25 ? 'hsl(var(--primary))' : 'transparent',
                    }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user?.name}</p>
                <Badge variant="secondary" className="text-xs">
                  {user?.plan === 'free' ? `${remainingPrompts} left` : 'Unlimited'}
                </Badge>
              </div>
            </div>
            
            <Button onClick={handleNewChat} className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border/50 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={activeChat?.id === chat.id}
                  onSelect={setActiveChat}
                  onDelete={handleDeleteChat}
                />
              ))}
            </div>
          </ScrollArea>

          {/* Quick Stats */}
          <div className="p-4 border-t border-border/50 bg-card/50 flex-shrink-0">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="text-foreground font-medium capitalize">{user?.plan}</span>
              </div>
              <div className="flex justify-between">
                <span>Chats:</span>
                <span className="text-foreground font-medium">{chats.length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Chat Area - Separate Scroll */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Toolbar */}
          <div className="border-b border-border/50 bg-card/30 p-4 flex-shrink-0">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {activeChat?.avatarId && (
                  <Badge variant="outline" className="text-sm">
                    <User className="h-3 w-3 mr-1" />
                    {activeChat.avatarName}
                  </Badge>
                )}
                
                <Button
                  size="sm"
                  variant={autoAI ? 'default' : 'outline'}
                  onClick={() => setAutoAI(!autoAI)}
                  disabled={!!activeChat?.avatarId}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Auto AI
                </Button>
                
                {!autoAI && !activeChat?.avatarId && (
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="text-sm bg-background border border-border rounded-md px-3 py-1.5 z-50"
                  >
                    {aiModels.map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={activeChat?.avatarId ? 'default' : 'outline'}
                  onClick={() => navigate('/avatars')}
                >
                  <User className="h-4 w-4 mr-2" />
                  {activeChat?.avatarId ? 'Change Avatar' : 'Select Avatar'}
                </Button>
                <Badge variant="outline" className="text-xs">
                  {activeChat?.messages.length || 0} messages
                </Badge>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
            {activeChat?.messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <Sparkles className="h-16 w-16 text-primary mx-auto mb-4 animate-glow-pulse" />
                  <h3 className="text-2xl font-bold mb-2">Start a Conversation</h3>
                  <p className="text-muted-foreground">
                    Ask anything, compare AI models, or chat with legendary avatars.
                  </p>
                </div>
              </div>
            ) : (
              activeChat?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary/20'
                        : 'bg-secondary/20'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 text-primary" />
                    ) : (
                      <Bot className="h-5 w-5 text-secondary" />
                    )}
                  </div>

                  <Card
                    className={`flex-1 max-w-3xl p-4 ${
                      message.role === 'user'
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-card/50 border-border/50'
                    }`}
                  >
                    {message.model && (
                      <Badge variant="outline" className="mb-2 text-xs">
                        {message.model}
                      </Badge>
                    )}
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyMessage(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              ))
            )}
            
            {isStreaming && (
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                  <Loader2 className="h-5 w-5 text-secondary animate-spin" />
                </div>
                <Card className="flex-1 max-w-3xl p-4 bg-card/50 border-border/50">
                  <p className="text-muted-foreground">AI is thinking...</p>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border/50 bg-card/30 p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              {/* Mode Selection */}
              <div className="flex gap-2 mb-3 flex-wrap">
                {[
                  { id: 'general', label: 'General', icon: MessageSquare },
                  { id: 'web', label: 'Web Search', icon: Globe },
                  { id: 'study', label: 'Study Help', icon: BookOpen },
                  { id: 'code', label: 'Coding', icon: Code },
                  { id: 'business', label: 'Business', icon: Briefcase },
                ].map((mode) => (
                  <Button
                    key={mode.id}
                    size="sm"
                    variant={selectedMode === mode.id ? 'default' : 'outline'}
                    onClick={() => setSelectedMode(mode.id)}
                    className="text-xs"
                  >
                    <mode.icon className="h-3 w-3 mr-1" />
                    {mode.label}
                  </Button>
                ))}
              </div>

              {/* Attached Files */}
              {attachedFiles.length > 0 && (
                <div className="mb-3 flex gap-2 flex-wrap">
                  {attachedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-sm"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="max-w-[200px] truncate">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="hover:bg-primary/20 rounded p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.json,.csv"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleFileAttach}
                  className="shrink-0"
                  title="Attach text file"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything..."
                  disabled={isStreaming}
                  rows={1}
                  className="flex-1 resize-none bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  style={{ minHeight: '52px', maxHeight: '200px' }}
                />
                
                <Button
                  onClick={isStreaming ? () => setIsStreaming(false) : handleSendMessage}
                  disabled={!inputValue.trim() && !isStreaming}
                  className="shrink-0"
                  size="lg"
                >
                  {isStreaming ? (
                    <Square className="h-5 w-5" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
