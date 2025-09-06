import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  HomeIcon,
  BookOpenIcon, 
  FolderIcon, 
  SearchIcon, 
  SettingsIcon, 
  GraduationCapIcon,
  ListTodoIcon
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { googleLogin } from '@/lib/api';
import { useAPI } from '@/lib/useAPI';
import { toast } from 'sonner';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Courses', href: '/courses', icon: BookOpenIcon },
  { name: 'Documents', href: '/documents', icon: FolderIcon },
  { name: 'Homework', href: '/homework', icon: ListTodoIcon },
  { name: 'Search', href: '/search', icon: SearchIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const qc = useQueryClient();
  const meQ = useAPI<{ ok: true; user: { email?: string } }>({
    route: { endpoint: '/api/auth/me', method: 'GET' },
  });
  const isAuthed = (meQ.data as any)?.ok === true;
  const email = (meQ.data as any)?.user?.email as string | undefined;
  const logout = useAPI({ route: { endpoint: '/api/auth/logout', method: 'POST' }, enabled: false });

  async function doLogout() {
    try {
      await logout.run();
      await qc.invalidateQueries({ queryKey: ['/api/auth/me', undefined, 'GET', 'json'] });
      toast.success('Logged out');
    } catch (e: any) {
      toast.error(String(e?.message || e));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Glass Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-glass-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <GraduationCapIcon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient-primary">Talvra</h1>
                <p className="text-xs text-foreground-secondary">AI Study Assistant</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/' && location.pathname.startsWith(item.href));
                
                return (
                  <Button
                    key={item.name}
                    asChild
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'gap-2 transition-all duration-smooth',
                      isActive && 'bg-background-secondary shadow-sm'
                    )}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </Button>
                );
              })}
            </nav>

            {/* Auth buttons */}
            <div className="flex items-center gap-2">
              {isAuthed ? (
                <>
                  {email && (
                    <span className="hidden md:inline text-sm text-foreground-secondary">{email}</span>
                  )}
                  <Button variant="outline" size="sm" onClick={doLogout}>Logout</Button>
                </>
              ) : (
                <Button variant="default" size="sm" onClick={googleLogin}>Login</Button>
              )}
              {/* Mobile Menu Button */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-glass-border">
        <div className="flex justify-around py-2">
          {navigation.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href));
            
            return (
              <Button
                key={item.name}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  'flex-col gap-1 h-auto py-2 px-3',
                  isActive && 'text-primary bg-primary-light'
                )}
              >
                <Link to={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span className="text-xs">{item.name}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}