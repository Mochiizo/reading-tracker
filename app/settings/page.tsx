'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/app/providers/auth-provider';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string;
  name: string;
  email: string;
}

const SettingsPage = () => {
  const { token, user: authUser, login } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // États pour la modification du mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/user/settings', {
          // L'en-tête d'autorisation n'est plus nécessaire, le cookie HTTP-only est envoyé automatiquement
          // headers: {
          //   'Authorization': `Bearer ${token}`,
          // },
        });

        if (!res.ok) {
          const errorData = await res.json();
          // Rediriger si non autorisé
          if (res.status === 401) {
            router.push('/login');
          }
          throw new Error(errorData.message || 'Erreur lors de la récupération des informations utilisateur.');
        }

        const data: UserData = await res.json();
        setUserData(data);
        setName(data.name);
        setEmail(data.email);
      } catch (err: any) {
        console.error("Erreur lors du chargement des informations utilisateur:", err);
        setError(err.message || 'Une erreur est survenue lors du chargement des informations.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // L'en-tête d'autorisation n'est plus nécessaire, le cookie HTTP-only est envoyé automatiquement
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Rediriger si non autorisé
        if (res.status === 401) {
          router.push('/login');
        }
        throw new Error(errorData.message || 'Erreur lors de la mise à jour des informations.');
      }

      const result = await res.json();
      setUserData(result.user); // Update local state with new user data
      if (authUser) {
        // Update user in AuthProvider context
        login(token as string, { ...authUser, name: result.user.name, email: result.user.email }); // Garde le token pour la signature, mais on ne l'envoie plus
      }
      toast({
        title: "Succès !",
        description: result.message,
        variant: "default",
      });
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour:", err);
      setError(err.message || 'Une erreur est survenue lors de la mise à jour de vos informations.');
      toast({
        title: "Erreur",
        description: err.message || 'Une erreur est survenue.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordChanging(true);
    setPasswordError(null);

    // Validation des mots de passe
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      setIsPasswordChanging(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      setIsPasswordChanging(false);
      return;
    }

    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // L'en-tête d'autorisation n'est plus nécessaire, le cookie HTTP-only est envoyé automatiquement
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Rediriger si non autorisé
        if (res.status === 401) {
          router.push('/login');
        }
        throw new Error(errorData.message || 'Erreur lors de la modification du mot de passe.');
      }

      const result = await res.json();
      
      // Réinitialiser les champs
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast({
        title: "Succès !",
        description: result.message,
        variant: "default",
      });
    } catch (err: any) {
      console.error("Erreur lors de la modification du mot de passe:", err);
      setPasswordError(err.message || 'Une erreur est survenue lors de la modification du mot de passe.');
      toast({
        title: "Erreur",
        description: err.message || 'Une erreur est survenue.',
        variant: "destructive",
      });
    } finally {
      setIsPasswordChanging(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Chargement des réglages...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Réglages</h1>

      <Card className="max-w-md mx-auto mb-6">
        <CardHeader>
          <CardTitle>Modifier vos informations</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Mise à jour...' : 'Enregistrer les modifications'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Modifier le mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe actuel</label>
              <Input
                type="password"
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nouveau mot de passe</label>
              <Input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmer le nouveau mot de passe</label>
              <Input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
            {passwordError && (
              <div className="text-red-500 text-sm">{passwordError}</div>
            )}
            <Button type="submit" disabled={isPasswordChanging}>
              {isPasswordChanging ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage; 