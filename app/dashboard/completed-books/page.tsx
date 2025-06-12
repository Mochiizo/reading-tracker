'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/app/providers/auth-provider';

interface CompletedBook {
  user_book_id: string;
  book_id: string;
  title: string;
  author: string;
  category: string;
  status: string;
  pages_read: number;
  total_pages: number;
  points_earned: number;
  progress: number;
  completed_at: string;
}

export default function CompletedBooksPage() {
  const [books, setBooks] = useState<CompletedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    const fetchCompletedBooks = async () => {
      try {
        const response = await fetch('/api/user/books/completed', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Erreur lors du chargement des livres terminés.');
        } else {
          setBooks(data.books);
        }
      } catch (err) {
        console.error('Erreur inattendue lors de la récupération des livres terminés:', err);
        setError('Une erreur inattendue est survenue lors du chargement des livres terminés.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedBooks();
  }, [user, token, router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100 dark:bg-gray-950">
      <h1 className="text-3xl font-bold mb-8 text-center">Mes Livres Lus</h1>

      <div className="flex justify-end mb-4">
        <Link href="/dashboard/add-book">
          <Button>Ajouter un nouveau livre</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Livres Terminés</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Pages Lues</TableHead>
                <TableHead>Total Pages</TableHead>
                <TableHead>Points Gagnés</TableHead>
                <TableHead className="text-right">Terminé le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.length > 0 ? (
                books.map((book) => (
                  <TableRow key={book.user_book_id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.category}</TableCell>
                    <TableCell>{book.pages_read}</TableCell>
                    <TableCell>{book.total_pages}</TableCell>
                    <TableCell>{book.points_earned || 0}</TableCell>
                    <TableCell className="text-right">{book.completed_at ? new Date(book.completed_at).toLocaleDateString() : 'N/A'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">Aucun livre terminé pour l'instant.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 