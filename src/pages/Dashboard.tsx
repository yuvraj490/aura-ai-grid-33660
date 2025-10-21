import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, Plus, Search, Pin, Trash2, Settings, MessageSquare, 
  Sparkles, User, Bot, Copy, RefreshCw, Square, Loader2
} from 'lucide-react';
import { Chat, Message, getChats, saveChat, createNewChat, deleteChat } from '@/utils/storage';
import { incrementPromptUsage, getRemainingPrompts } from '@/utils/auth';
import { supabase } from '@/integrations/supabase/client';

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const handleNewChat = () => {
    if (!user) return;
    const newChat = createNewChat(user.id);
    // New chat clears avatar mode
    setChats([newChat, ...chats]);
    setActiveChat(newChat);
    toast({ title: 'New chat created' });
  };

  const handleDeleteChat = (chatId: string) => {
    if (!user) return;
    deleteChat(user.id, chatId);
    const updatedChats = chats.filter(c => c.id !== chatId);
    setChats(updatedChats);
    
    if (activeChat?.id === chatId) {
      setActiveChat(updatedChats[0] || null);
    }
    
    toast({ title: 'Chat deleted' });
  };

  const callAIAPI = async (messages: Array<{role: string; content: string}>, avatarId?: string, model?: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { messages, avatarId, model }
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

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, userMessage],
      updatedAt: new Date().toISOString(),
      title: activeChat.messages.length === 0 ? inputValue.slice(0, 50) : activeChat.title,
    };

    setActiveChat(updatedChat);
    saveChat(user.id, updatedChat);
    setChats(chats.map(c => c.id === updatedChat.id ? updatedChat : c));
    setInputValue('');
    setIsStreaming(true);
    refreshUser();

    try {
      // Build conversation history
      const conversationMessages = updatedChat.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call AI API with selected model if Auto AI is off
      const modelToUse = autoAI ? undefined : selectedModel;
      const response = await callAIAPI(conversationMessages, activeChat?.avatarId, modelToUse);
      
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

      setActiveChat(finalChat);
      saveChat(user.id, finalChat);
      setChats(chats.map(c => c.id === finalChat.id ? finalChat : c));
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

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
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
          <div className="flex-1 overflow-y-auto p-2 min-h-0">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors group ${
                  activeChat?.id === chat.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{chat.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.messages.length} messages
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </button>
            ))}
          </div>

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
              <div className="flex items-end gap-2">
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
