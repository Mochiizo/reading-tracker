'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/app/providers/auth-provider';

interface Category {
  id: string;
  name: string;
}

export default function AddBookPage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<string | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (response.ok) {
          setCategories(data);
        } else {
          setError(data.message || 'Erreur lors du chargement des catégories.');
        }
      } catch (err) {
        console.error('Erreur inattendue lors de la récupération des catégories:', err);
        setError('Une erreur inattendue est survenue lors du chargement des catégories.');
      }
    };

    fetchCategories();
  }, [user, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user || !token) {
      setError('Vous devez être connecté pour ajouter un livre.');
      router.push('/login');
      return;
    }

    if (!title || !author || !totalPages || !categoryId) {
      setError('Tous les champs sont requis.');
      return;
    }

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, author, total_pages: totalPages, category_id: categoryId, user_id: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erreur lors de l\'ajout du livre.');
      } else {
        setSuccess(data.message || 'Livre ajouté avec succès !');
        setTitle('');
        setAuthor('');
        setTotalPages('');
        setCategoryId('');
        router.push('/dashboard'); // Rediriger vers le tableau de bord après l'ajout
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Une erreur inattendue est survenue.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Ajouter un Livre</CardTitle>
          <CardDescription>Remplissez les détails du livre que vous souhaitez ajouter.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <Button type="submit" className="w-full">Ajouter le livre</Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            <a href="/dashboard" className="font-medium text-blue-600 hover:underline">Retour au tableau de bord</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 