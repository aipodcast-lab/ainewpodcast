'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Mic2, Edit, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/firebase/auth';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Button } from './ui/button';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  const navItems = [
    {
      href: '/create',
      icon: Mic2,
      label: 'Create Podcast'
    },
    {
      href: '/edit',
      icon: Edit,
      label: 'Edit Audio'
    },
    {
      href: '/profile',
      icon: Mic2,
      label: 'My Profile'
    }
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">AI Podcast</h1>
      </div>
      
      <nav className="space-y-2 px-4 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link 
            key={href}
            href={href} 
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
              pathname === href 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}