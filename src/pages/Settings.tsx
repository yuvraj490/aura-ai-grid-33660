import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, CreditCard, Bell, Shield, Download, Trash2 } from 'lucide-react';

export default function Settings() {
  const { profile, isAuthenticated, refreshUser, logout } = useSupabaseAuth();
  const user = profile;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(false);

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const handleSaveProfile = async () => {
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ name, email })
        .eq('id', user.id);

      if (error) {
        toast({ 
          title: 'Error updating profile', 
          description: error.message,
          variant: 'destructive'
        });
      } else {
        await refreshUser();
        toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
      }
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    
    // Export user data and chats from Supabase
    const { data: chatLogs } = await supabase
      .from('chat_logs')
      .select('*')
      .eq('user_id', user.id);
    
    const data = {
      user,
      chats: chatLogs || [],
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multiAiHub-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    toast({ title: 'Data exported', description: 'Your data has been downloaded.' });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Delete user profile and related data (cascade delete will handle chat_logs)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      if (error) {
        toast({ 
          title: 'Error', 
          description: error.message,
          variant: 'destructive'
        });
      } else {
        await logout();
        toast({ title: 'Account deleted', description: 'Your account has been permanently deleted.' });
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <Card className="p-6 border-border/50 bg-card/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Profile</h2>
                  <p className="text-sm text-muted-foreground">Update your personal information</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </Card>

            {/* Subscription */}
            <Card className="p-6 border-border/50 bg-card/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Subscription</h2>
                  <p className="text-sm text-muted-foreground">Manage your billing and plan</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                  <div>
                    <p className="font-semibold capitalize">{user.plan} Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.plan === 'free' ? `${user.prompts_used}/${user.prompts_limit} prompts used today` : 'Unlimited prompts'}
                  </p>
                  </div>
                  {user.plan === 'free' && (
                    <Button onClick={() => navigate('/billing')} size="sm">
                      Upgrade
                    </Button>
                  )}
                </div>

                <Button variant="outline" onClick={() => navigate('/billing')}>
                  Manage Billing
                </Button>
              </div>
            </Card>

            {/* Preferences */}
            <Card className="p-6 border-border/50 bg-card/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Preferences</h2>
                  <p className="text-sm text-muted-foreground">Customize your experience</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Reduced Motion</p>
                    <p className="text-sm text-muted-foreground">Minimize animations</p>
                  </div>
                  <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">High Contrast</p>
                    <p className="text-sm text-muted-foreground">Increase text contrast</p>
                  </div>
                  <Switch checked={highContrast} onCheckedChange={setHighContrast} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Voice Output</p>
                    <p className="text-sm text-muted-foreground">Enable text-to-speech</p>
                  </div>
                  <Switch checked={voiceOutput} onCheckedChange={setVoiceOutput} />
                </div>
              </div>
            </Card>

            {/* Data & Privacy */}
            <Card className="p-6 border-border/50 bg-card/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Data & Privacy</h2>
                  <p className="text-sm text-muted-foreground">Manage your data</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={handleExportData} variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Chat History
                </Button>

                <Button
                  onClick={handleDeleteAccount}
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
