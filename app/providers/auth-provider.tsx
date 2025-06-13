'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Interface définissant la structure d'un utilisateur
 */
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * Interface définissant le type du contexte d'authentification
 */
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loginTrigger: number;
}

// Création du contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fournisseur d'authentification
 * Gère l'état de l'authentification et fournit les méthodes de connexion/déconnexion
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // États pour gérer l'utilisateur, le token et le chargement
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginTrigger, setLoginTrigger] = useState(0);
  const router = useRouter();

  /**
   * Effet pour vérifier la session au montage du composant
   */
  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Récupération de la session depuis l'API
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

  /**
   * Fonction de connexion
   * Met à jour l'état de l'utilisateur et déclenche un rafraîchissement
   */
  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    setLoginTrigger(Date.now());
    console.log("AuthProvider - User after login:", newUser);
    console.log("AuthProvider - Login Trigger after login:", Date.now());
    router.refresh();
  };

  /**
   * Fonction de déconnexion
   * Déconnecte l'utilisateur et redirige vers la page de connexion
   */
  const logout = async () => {
    try {
      // Appel à l'API de déconnexion
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!res.ok) {
        console.error("Erreur lors de la déconnexion de l'utilisateur:", await res.json());
      }
    } catch (error) {
      console.error("Erreur inattendue lors de la déconnexion:", error);
    } finally {
      // Nettoyage des données d'authentification
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setLoginTrigger(Date.now());
      console.log("AuthProvider - User after logout:", null);
      console.log("AuthProvider - Login Trigger after logout:", Date.now());
      router.push('/login');
    }
  };

  // Affichage pendant le chargement de la session
  if (loading) {
    return <div>Chargement de la session...</div>;
  }

  // Fourniture du contexte d'authentification
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loginTrigger }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 * @throws {Error} Si utilisé en dehors d'un AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé au sein d\'un AuthProvider');
  }
  return context;
} 