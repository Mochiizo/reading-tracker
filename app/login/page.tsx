'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Page de connexion de l'application
 * Permet aux utilisateurs de se connecter avec leur email et mot de passe
 */
export default function LoginPage() {
  // États pour gérer les champs du formulaire et les erreurs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Gère la soumission du formulaire de connexion
   * @param {React.FormEvent} e - L'événement de soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Envoi de la requête de connexion à l'API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erreur lors de la connexion.');
      } else {
        // Stockage des informations utilisateur et redirection
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/loading'); // Redirection vers la page de chargement après connexion
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Une erreur inattendue est survenue.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      {/* Carte de connexion */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>Connectez-vous à votre compte.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
            {/* Affichage des erreurs */}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {/* Bouton de soumission */}
            <Button type="submit" className="w-full">Se connecter</Button>
          </form>
          {/* Lien vers la page d'inscription */}
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Pas encore de compte ? <a href="/register" className="font-medium text-blue-600 hover:underline">Inscrivez-vous ici</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
