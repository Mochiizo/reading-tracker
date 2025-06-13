'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/app/providers/auth-provider';

/**
 * Interface définissant la structure d'une catégorie
 */
interface Category {
  id: string;
  name: string;
}

/**
 * Page d'ajout de livre
 * Permet aux utilisateurs d'ajouter un nouveau livre à leur bibliothèque
 */
export default function AddBookPage() {
  // États pour gérer les champs du formulaire et les retours utilisateur
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<string | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { user, token } = useAuth();

  /**
   * Effet pour charger les catégories disponibles au montage du composant
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Récupération des catégories depuis l'API
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (!response.ok) {
          // Redirection si non autorisé
          if (response.status === 401) {
            router.push('/login');
          }
          throw new Error(data.message || 'Erreur lors du chargement des catégories.');
        } else {
          setCategories(data);
        }
      } catch (err) {
        console.error('Erreur inattendue lors de la récupération des catégories:', err);
        setError('Une erreur inattendue est survenue lors du chargement des catégories.');
      }
    };

    fetchCategories();
  }, [user, router]);

  /**
   * Gestionnaire de soumission du formulaire
   * Vérifie les données et envoie la requête d'ajout de livre
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Vérification de l'authentification
    if (!user) {
      setError('Vous devez être connecté pour ajouter un livre.');
      router.push('/login');
      return;
    }

    // Validation des champs requis
    if (!title || !author || !totalPages || !categoryId) {
      setError('Tous les champs sont requis.');
      return;
    }

    try {
      // Envoi de la requête d'ajout de livre
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, author, total_pages: totalPages, category_id: categoryId, user_id: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erreur lors de l\'ajout du livre.');
        if (response.status === 401) {
          router.push('/login');
        }
      } else {
        // Réinitialisation du formulaire et redirection en cas de succès
        setSuccess(data.message || 'Livre ajouté avec succès !');
        setTitle('');
        setAuthor('');
        setTotalPages('');
        setCategoryId('');
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Une erreur inattendue est survenue.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      {/* Carte contenant le formulaire d'ajout de livre */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Ajouter un Livre</CardTitle>
          <CardDescription>Remplissez les détails du livre que vous souhaitez ajouter.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champ titre */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Titre</label>
              <Input
                id="title"
                type="text"
                placeholder="Titre du livre"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            {/* Champ auteur */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Auteur</label>
              <Input
                id="author"
                type="text"
                placeholder="Nom de l'auteur"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
            {/* Champ nombre de pages */}
            <div>
              <label htmlFor="totalPages" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Nombre de pages</label>
              <Input
                id="totalPages"
                type="number"
                placeholder="Ex: 300"
                value={totalPages}
                onChange={(e) => setTotalPages(Number(e.target.value) || '')}
                required
              />
            </div>
            {/* Sélection de la catégorie */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Catégorie</label>
              <Select onValueChange={setCategoryId} value={categoryId.toString()} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Messages d'erreur et de succès */}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <Button type="submit" className="w-full">Ajouter le livre</Button>
          </form>
          {/* Lien de retour au tableau de bord */}
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            <a href="/dashboard" className="font-medium text-blue-600 hover:underline">Retour au tableau de bord</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 