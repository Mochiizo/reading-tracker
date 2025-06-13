'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Page d'inscription de l'application
 * Permet aux nouveaux utilisateurs de créer un compte
 */
export default function RegisterPage() {
  // États pour gérer les champs du formulaire, les erreurs et les messages de succès
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Gère la soumission du formulaire d'inscription
   * @param {React.FormEvent} e - L'événement de soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Envoi de la requête d'inscription à l'API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erreur lors de l\'inscription.');
      } else {
        // Réinitialisation du formulaire et redirection après inscription réussie
        setSuccess(data.message || 'Inscription réussie !');
        setName('');
        setEmail('');
        setPassword('');
        router.push('/login'); // Redirection vers la page de connexion
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Une erreur inattendue est survenue.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      {/* Carte d'inscription */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Inscription</CardTitle>
          <CardDescription>Créez votre compte pour commencer à suivre vos lectures.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Formulaire d'inscription */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champ nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Nom</label>
              <Input
                id="name"
                type="text"
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            {/* Champ email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {/* Champ mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Mot de passe</label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {/* Affichage des messages d'erreur et de succès */}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            {/* Bouton de soumission */}
            <Button type="submit" className="w-full">S'inscrire</Button>
          </form>
          {/* Lien vers la page de connexion */}
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Déjà un compte ? <a href="/login" className="font-medium text-blue-600 hover:underline">Connectez-vous ici</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 