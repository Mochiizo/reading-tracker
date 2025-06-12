'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/app/providers/auth-provider';
import { useToast } from '@/components/ui/use-toast';

interface UserData {
  id: string;
  name: string;
  email: string;
}

const SettingsPage = () => {
  const { token, user: authUser, login } = useAuth(); // Also get login to update user in context
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setError('Authentification requise pour charger les informations de l\'utilisateur.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/user/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
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

    if (!token) {
      setError('Authentification requise pour modifier les informations.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour des informations.');
      }

      const result = await res.json();
      setUserData(result.user); // Update local state with new user data
      if (authUser) {
        // Update user in AuthProvider context
        login(token, { ...authUser, name: result.user.name, email: result.user.email });
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

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Chargement des réglages...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Réglages</h1>

      <Card className="max-w-md mx-auto">
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
    </div>
  );
};

export default SettingsPage; 