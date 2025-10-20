import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, MessageSquare, TrendingUp, Activity, Search, 
  RefreshCw, AlertCircle, BarChart3
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'premium';
  prompts_used: number;
  prompts_limit: number;
  created_at: string;
  chat_count: number;
}

export default function NewAdmin() {
  const { user, isAdmin, isAuthenticated } = useSupabaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalChats: 0,
    totalMessages: 0,
    freeUsers: 0,
    premiumUsers: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/dashboard');
      return;
    }

    loadData();
  }, [isAuthenticated, isAdmin, navigate]);

  const loadData = async () => {
    // Fetch all users with their profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error loading profiles:', profilesError);
      return;
    }

    // Fetch chat logs to count
    const { data: chatLogs, error: logsError } = await supabase
      .from('chat_logs')
      .select('*');

    if (logsError) {
      console.error('Error loading chat logs:', logsError);
    }

    // Calculate stats
    const today = new Date().toDateString();
    const activeToday = new Set();
    
    chatLogs?.forEach(log => {
      const logDate = new Date(log.created_at).toDateString();
      if (logDate === today) {
        activeToday.add(log.user_id);
      }
    });

    // Count chats per user
    const userChatCounts: { [key: string]: number } = {};
    chatLogs?.forEach(log => {
      userChatCounts[log.user_id] = (userChatCounts[log.user_id] || 0) + 1;
    });

    const usersWithChatCount = profiles?.map(profile => ({
      ...profile,
      chat_count: userChatCounts[profile.id] || 0
    })) || [];

    setAllUsers(usersWithChatCount);

    setStats({
      totalUsers: profiles?.length || 0,
      activeToday: activeToday.size,
      totalChats: chatLogs?.length || 0,
      totalMessages: chatLogs?.reduce((sum, log) => sum + (log.response_length || 0), 0) || 0,
      freeUsers: profiles?.filter(u => u.plan === 'free').length || 0,
      premiumUsers: profiles?.filter(u => u.plan === 'premium').length || 0,
    });
  };

  const handleChangePlan = async (userId: string, newPlan: 'free' | 'premium') => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        plan: newPlan,
        prompts_limit: newPlan === 'free' ? 50 : 999999,
        prompts_used: 0
      })
      .eq('id', userId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update plan',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Plan updated',
      description: `User's plan has been changed to ${newPlan}.`,
    });

    loadData();
  };

  const handleRefillPrompts = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ prompts_used: 0 })
      .eq('id', userId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to refill prompts',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Prompts refilled',
      description: `User's prompts have been reset.`,
    });

    loadData();
  };

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Admin Panel</h1>
            </div>
            <p className="text-muted-foreground">
              Manage users, monitor system health, and view analytics
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 border-border/50 bg-card/50">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-primary" />
                <Badge variant="secondary">{stats.totalUsers}</Badge>
              </div>
              <h3 className="font-semibold text-sm text-muted-foreground">Total Users</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
            </Card>

            <Card className="p-6 border-border/50 bg-card/50">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-8 w-8 text-green-500" />
                <Badge variant="secondary">{stats.activeToday}</Badge>
              </div>
              <h3 className="font-semibold text-sm text-muted-foreground">Active Today</h3>
              <p className="text-3xl font-bold mt-2">{stats.activeToday}</p>
            </Card>

            <Card className="p-6 border-border/50 bg-card/50">
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="h-8 w-8 text-secondary" />
                <Badge variant="secondary">{stats.totalChats}</Badge>
              </div>
              <h3 className="font-semibold text-sm text-muted-foreground">Total Chats</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalChats}</p>
            </Card>

            <Card className="p-6 border-border/50 bg-card/50">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                <Badge variant="secondary">{stats.totalMessages}</Badge>
              </div>
              <h3 className="font-semibold text-sm text-muted-foreground">Total Messages</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalMessages}</p>
            </Card>
          </div>

          {/* Plans Distribution */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 border-border/50 bg-card/50">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Plans Distribution
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Free</span>
                    <span className="font-semibold">{stats.freeUsers} users</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-muted-foreground"
                      style={{ width: `${stats.totalUsers > 0 ? (stats.freeUsers / stats.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Premium</span>
                    <span className="font-semibold">{stats.premiumUsers} users</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${stats.totalUsers > 0 ? (stats.premiumUsers / stats.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* User Management */}
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Management
              </h3>
              <Button onClick={loadData} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-3 font-semibold">Name</th>
                    <th className="text-left p-3 font-semibold">Email</th>
                    <th className="text-left p-3 font-semibold">Plan</th>
                    <th className="text-left p-3 font-semibold">Prompts Used</th>
                    <th className="text-left p-3 font-semibold">Chats</th>
                    <th className="text-left p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3">{u.name}</td>
                      <td className="p-3 text-muted-foreground">{u.email}</td>
                      <td className="p-3">
                        <select
                          value={u.plan}
                          onChange={(e) => handleChangePlan(u.id, e.target.value as 'free' | 'premium')}
                          className="text-sm bg-background border border-border rounded px-2 py-1"
                        >
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">
                          {u.plan === 'free' ? `${u.prompts_used}/${u.prompts_limit}` : 'Unlimited'}
                        </span>
                      </td>
                      <td className="p-3">{u.chat_count}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRefillPrompts(u.id)}
                            title="Refill prompts"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {searchQuery ? 'No users found matching your search.' : 'No users yet.'}
                </p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
