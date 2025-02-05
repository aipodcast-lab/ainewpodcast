'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './auth';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const token = await user.getIdToken();
          Cookies.set('auth', token, { expires: 7 });
          setUser(user);
          
          if (pathname === '/auth') {
            router.replace('/create');
          }
        } else {
          Cookies.remove('auth');
          setUser(null);
          
          if (pathname !== '/auth') {
            router.replace('/auth');
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Please try signing in again'
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, pathname, toast]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);