import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Sparkles, Menu } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export const Header = () => {
  const { isAuthenticated, user, logout, isAdmin } = useSupabaseAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-primary animate-glow-pulse" />
            <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Multi-AI Hub
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/avatars" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Avatars
              </Link>
              <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Settings
              </Link>
              <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Help
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                  Admin
                </Link>
              )}
              <Button onClick={logout} variant="outline" size="sm">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-gradient-primary">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
