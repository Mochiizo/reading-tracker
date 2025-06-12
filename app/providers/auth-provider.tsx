'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loginTrigger: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginTrigger, setLoginTrigger] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();

        if (data.isAuthenticated && data.user) {
          setUser(data.user);
          setLoginTrigger(Date.now());
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
        }
      } catch (e) {
        console.error('Erreur lors de la récupération de la session:', e);
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    setLoginTrigger(Date.now());
    console.log("AuthProvider - User after login:", newUser);
    console.log("AuthProvider - Login Trigger after login:", Date.now());
    router.refresh();
  };

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!res.ok) {
        console.error("Erreur lors de la déconnexion de l'utilisateur:", await res.json());
      }
    } catch (error) {
      console.error("Erreur inattendue lors de la déconnexion:", error);
    } finally {
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setLoginTrigger(Date.now());
      console.log("AuthProvider - User after logout:", null);
      console.log("AuthProvider - Login Trigger after logout:", Date.now());
      router.push('/login');
    }
  };

  if (loading) {
    return <div>Chargement de la session...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loginTrigger }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé au sein d\'un AuthProvider');
  }
  return context;
} 