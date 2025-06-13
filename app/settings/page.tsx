'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/app/providers/auth-provider';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Interface définissant la structure des données utilisateur
 */
interface UserData {
  id: string;
  name: string;
  email: string;
}

/**
 * Page des paramètres utilisateur
 * Permet aux utilisateurs de modifier leurs informations personnelles et leur mot de passe
 */
const SettingsPage = () => {
  // Hooks pour l'authentification, les notifications et la navigation
  const { token, user: authUser, login, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // États pour les informations utilisateur
  const [userData, setUserData] = useState<UserData | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour la modification du mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // États pour la suppression du compte
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /**
   * Effet pour charger les informations utilisateur au montage du composant
   */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Récupération des informations utilisateur depuis l'API
        const res = await fetch('/api/user/settings', {
          // L'en-tête d'autorisation n'est plus nécessaire, le cookie HTTP-only est envoyé automatiquement
        });

        if (!res.ok) {
          const errorData = await res.json();
          // Redirection si non autorisé
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

  /**
   * Gestionnaire de soumission du formulaire de modification des informations
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Envoi de la requête de mise à jour des informations
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Redirection si non autorisé
        if (res.status === 401) {
          router.push('/login');
        }
        throw new Error(errorData.message || 'Erreur lors de la mise à jour des informations.');
      }

      const result = await res.json();
      setUserData(result.user);
      if (authUser) {
        // Mise à jour du contexte d'authentification
        login(token as string, { ...authUser, name: result.user.name, email: result.user.email });
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

  /**
   * Gestionnaire de soumission du formulaire de modification du mot de passe
   */
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
      // Envoi de la requête de modification du mot de passe
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Redirection si non autorisé
        if (res.status === 401) {
          router.push('/login');
        }
        throw new Error(errorData.message || 'Erreur lors de la modification du mot de passe.');
      }

      const result = await res.json();
      
      // Réinitialisation des champs
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

  /**
   * Gestionnaire de suppression du compte
   * Supprime définitivement le compte utilisateur et toutes ses données associées
   */
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 401) {
          router.push('/login');
        }
        throw new Error(errorData.message || 'Erreur lors de la suppression du compte.');
      }

      // Déconnexion et redirection après la suppression
      await logout();
      toast({
        title: "Compte supprimé",
        description: "Votre compte et toutes vos données ont été supprimés avec succès.",
        variant: "default",
      });
      router.push('/');
    } catch (err: any) {
      console.error("Erreur lors de la suppression du compte:", err);
      setDeleteError(err.message || 'Une erreur est survenue lors de la suppression du compte.');
      toast({
        title: "Erreur",
        description: err.message || 'Une erreur est survenue.',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Affichage pendant le chargement
  if (loading) {
    return <div className="container mx-auto p-4 text-center">Chargement des réglages...</div>;
  }

  // Affichage en cas d'erreur
  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Réglages</h1>

      {/* Carte de modification des informations utilisateur */}
      <Card className="max-w-md mx-auto mb-6">
        <CardHeader>
          <CardTitle>Modifier vos informations</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champ nom */}
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
            {/* Champ email */}
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

      {/* Carte de modification du mot de passe */}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Modifier le mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Champ mot de passe actuel */}
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
            {/* Champ nouveau mot de passe */}
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
            {/* Champ confirmation du nouveau mot de passe */}
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
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            <Button type="submit" disabled={isPasswordChanging}>
              {isPasswordChanging ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Carte de suppression du compte */}
      <Card className="max-w-md mx-auto mt-6 border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500">Zone dangereuse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              La suppression de votre compte est irréversible. Toutes vos données seront définitivement supprimées, y compris :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>Vos informations personnelles</li>
              <li>Votre historique de lecture</li>
              <li>Vos badges et récompenses</li>
              <li>Vos statistiques de lecture</li>
            </ul>
            {deleteError && <p className="text-red-500 text-sm">{deleteError}</p>}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Supprimer mon compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                    Pour confirmer, veuillez saisir votre mot de passe.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Input
                    type="password"
                    placeholder="Votre mot de passe"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || !currentPassword}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage; 