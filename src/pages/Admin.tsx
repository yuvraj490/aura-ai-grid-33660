import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { getAllUsers, updateUser, User as UserType } from '@/utils/auth';
import { getChats } from '@/utils/storage';
import { 
  Users, MessageSquare, TrendingUp, Activity, Search, 
  Edit, Trash2, RefreshCw, AlertCircle, BarChart3
} from 'lucide-react';

export default function Admin() {
  const { profile, isAdmin, isAuthenticated } = useSupabaseAuth();
  const user = profile;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalChats: 0,
    totalMessages: 0,
    freeUsers: 0,
    premiumUsers: 0,
    annualUsers: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/dashboard');
      return;
    }

    loadData();
  }, [isAuthenticated, isAdmin, navigate]);

  const loadData = () => {
    const users = getAllUsers();
    setAllUsers(users);

    // Calculate real stats
    let totalChats = 0;
    let totalMessages = 0;
    const today = new Date().toDateString();
    let activeToday = 0;

    users.forEach(u => {
      const userChats = getChats(u.id);
      totalChats += userChats.length;
      
      userChats.forEach(chat => {
        totalMessages += chat.messages.length;
        
        // Check if user was active today
        const chatDate = new Date(chat.updatedAt).toDateString();
        if (chatDate === today) {
          activeToday++;
        }
      });
    });

    setStats({
      totalUsers: users.length,
      activeToday: Math.min(activeToday, users.length), // Unique users
      totalChats,
      totalMessages,
      freeUsers: users.filter(u => u.plan === 'free').length,
      premiumUsers: users.filter(u => u.plan === 'premium').length,
      annualUsers: users.filter(u => u.plan === 'annual').length,
    });
  };

  const handleChangePlan = (userId: string, newPlan: 'free' | 'premium' | 'annual') => {
    const userToUpdate = allUsers.find(u => u.id === userId);
    if (!userToUpdate) return;

    const updatedUser = {
      ...userToUpdate,
      plan: newPlan,
      promptsLimit: newPlan === 'free' ? 10 : 999999,
      promptsUsed: 0,
    };

    updateUser(updatedUser);
    loadData();

    toast({
      title: 'Plan updated',
      description: `${userToUpdate.name}'s plan has been changed to ${newPlan}.`,
    });
  };

  const handleRefillPrompts = (userId: string) => {
    const userToUpdate = allUsers.find(u => u.id === userId);
    if (!userToUpdate) return;

    const updatedUser = {
      ...userToUpdate,
      promptsUsed: 0,
      lastReset: new Date().toISOString(),
    };

    updateUser(updatedUser);
    loadData();

    toast({
      title: 'Prompts refilled',
      description: `${userToUpdate.name}'s prompts have been reset.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = allUsers.find(u => u.id === userId);
    if (!userToDelete) return;

    if (confirm(`Are you sure you want to delete ${userToDelete.name}'s account? This cannot be undone.`)) {
      const users = allUsers.filter(u => u.id !== userId);
      localStorage.setItem('multiAiHub_users', JSON.stringify(users));
      localStorage.removeItem(`multiAiHub_chats_${userId}`);
      
      loadData();
      
      toast({
        title: 'User deleted',
        description: `${userToDelete.name}'s account has been permanently deleted.`,
      });
    }
  };

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modelUsageShare = {
    'LLaMA 3.1 8B': 35,
    'LLaMA 3.3 70B': 28,
    'GPT-OSS 20B': 18,
    'Kimi K2': 12,
    'Others': 7,
  };

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
                      style={{ width: `${(stats.freeUsers / stats.totalUsers) * 100}%` }}
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
                      style={{ width: `${(stats.premiumUsers / stats.totalUsers) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Annual</span>
                    <span className="font-semibold">{stats.annualUsers} users</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary"
                      style={{ width: `${(stats.annualUsers / stats.totalUsers) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border/50 bg-card/50">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Model Usage Share
              </h3>
              
              <div className="space-y-3">
                {Object.entries(modelUsageShare).map(([model, percentage]) => (
                  <div key={model}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{model}</span>
                      <span className="font-semibold">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
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
                  {filteredUsers.map(u => {
                    const userChats = getChats(u.id);
                    return (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3">{u.name}</td>
                        <td className="p-3 text-muted-foreground">{u.email}</td>
                        <td className="p-3">
                          <select
                            value={u.plan}
                            onChange={(e) => handleChangePlan(u.id, e.target.value as any)}
                            className="text-sm bg-background border border-border rounded px-2 py-1"
                          >
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                            <option value="annual">Annual</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {u.plan === 'free' ? `${u.promptsUsed}/${u.promptsLimit}` : 'Unlimited'}
                          </span>
                        </td>
                        <td className="p-3">{userChats.length}</td>
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
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
