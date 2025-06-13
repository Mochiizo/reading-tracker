'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

/**
 * Page du tableau de bord de l'application
 * Affiche les statistiques de l'utilisateur, ses badges et la liste de ses livres
 */
export default function DashboardPage() {
  // États pour gérer les données utilisateur et l'interface
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateProgressDialogOpen, setIsUpdateProgressDialogOpen] = useState(false);
  const [selectedBookToUpdate, setSelectedBookToUpdate] = useState<any>(null);
  const [pagesReadInput, setPagesReadInput] = useState<number | ''>('');
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<string[]>([]);
  const router = useRouter();

  /**
   * Récupère les données du tableau de bord depuis l'API
   */
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/user/dashboard', {
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erreur lors du chargement des données du tableau de bord.');
      } else {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Erreur inattendue lors de la récupération du tableau de bord:', err);
      setError('Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    fetchDashboardData();
  }, [router]);

  /**
   * Gère le clic sur le bouton de mise à jour de la progression
   * @param {any} book - Le livre à mettre à jour
   */
  const handleUpdateProgressClick = (book: any) => {
    setSelectedBookToUpdate(book);
    setPagesReadInput(book.pages_read);
    setIsUpdateProgressDialogOpen(true);
  };

  /**
   * Sauvegarde la progression mise à jour d'un livre
   */
  const handleSaveProgress = async () => {
    if (!selectedBookToUpdate || pagesReadInput === '' || pagesReadInput < 0) {
      setError('Veuillez entrer un nombre de pages valide.');
      return;
    }

    try {
      const response = await fetch('/api/user/books/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_book_id: selectedBookToUpdate.user_book_id,
          pages_read: pagesReadInput,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erreur lors de la mise à jour de la progression.');
        if (response.status === 401) {
          router.push('/login');
        }
      } else {
        setIsUpdateProgressDialogOpen(false);
        setSelectedBookToUpdate(null);
        setPagesReadInput('');
        fetchDashboardData(); // Recharger les données du tableau de bord
      }
    } catch (err) {
      console.error('Erreur inattendue lors de la sauvegarde de la progression:', err);
      setError('Une erreur inattendue est survenue lors de la sauvegarde de la progression.');
    }
  };

  /**
   * Marque un livre comme terminé
   * @param {string} userBookId - L'ID du livre utilisateur à marquer comme terminé
   */
  const handleMarkAsComplete = async (userBookId: string) => {
    const confirmation = window.confirm("Êtes-vous sûr de vouloir marquer ce livre comme terminé ?");
    if (!confirmation) {
      return;
    }

    try {
      const response = await fetch('/api/user/books/complete', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_book_id: userBookId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erreur lors du marquage du livre comme terminé.');
        if (response.status === 401) {
          router.push('/login');
        }
      } else {
        fetchDashboardData(); // Recharger les données du tableau de bord
        if (data.newlyUnlockedBadges && data.newlyUnlockedBadges.length > 0) {
          setNewlyUnlockedBadges(data.newlyUnlockedBadges);
          alert(`Félicitations ! Vous avez débloqué de nouveaux badges : ${data.newlyUnlockedBadges.join(', ')}`);
        } else {
          alert(data.message);
        }
      }
    } catch (err) {
      console.error('Erreur inattendue lors du marquage du livre comme terminé:', err);
      setError('Une erreur inattendue est survenue lors du marquage du livre comme terminé.');
    }
  };

  // Affichage pendant le chargement
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>;
  }

  // Affichage en cas d'erreur
  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">{error}</div>;
  }

  // Vérification de la présence des données utilisateur
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100 dark:bg-gray-950">
      {/* En-tête avec nom d'utilisateur et bouton d'ajout de livre */}
      <h1 className="text-3xl font-bold mb-8 text-center">Bienvenue, {user.name || user.email}!</h1>
      
      <div className="flex justify-center mb-8">
        <Link href="/dashboard/add-book">
          <Button className="text-lg">Ajouter un nouveau livre</Button>
        </Link>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Carte des points totaux */}
        <Card>
          <CardHeader>
            <CardTitle>Points Totaux</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{user.total_points || 0}</p>
          </CardContent>
        </Card>

        {/* Carte du niveau actuel */}
        <Card>
          <CardHeader>
            <CardTitle>Niveau Actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">Niveau {user.current_level || 1}</p>
            <Progress value={user.total_points % 100} className="mt-4" />
            <p className="text-sm text-gray-500 mt-2">Progrès vers le prochain niveau</p>
          </CardContent>
        </Card>

        {/* Carte des livres lus */}
        <Link href="/dashboard/completed-books" className="block">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Livres Lus</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              <p className="text-4xl font-bold">{user.books_read_count || 0}</p>
            </CardContent>
            <div className="p-4 border-t text-sm text-center text-blue-600 hover:underline">
              Voir tous les livres lus
            </div>
          </Card>
        </Link>
      </div>

      {/* Section des badges obtenus */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Badges Obtenus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {user.badges && user.badges.length > 0 ? (
              user.badges.map((badge: any) => (
                <span key={badge.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {badge.name}
                </span>
              ))
            ) : (
              <p className="text-gray-500">Aucun badge obtenu pour l'instant.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tableau des livres en cours */}
      <Card>
        <CardHeader>
          <Link href="/dashboard/completed-books">
            <CardTitle className='underline'>Mes Lectures</CardTitle>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.books && user.books.length > 0 ? (
                user.books.map((book: any) => (
                  <TableRow key={book.user_book_id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.category}</TableCell>
                    <TableCell>{book.status}</TableCell>
                    <TableCell>{book.progress}%</TableCell>
                    <TableCell className="text-right">{book.points_earned || 0}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUpdateProgressClick(book)}
                        className="mr-2"
                      >
                        Mettre à jour
                      </Button>
                      {book.status === 'in_progress' && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handleMarkAsComplete(book.user_book_id)}
                        >
                          Terminer
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    Aucun livre en cours de lecture.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isUpdateProgressDialogOpen} onOpenChange={setIsUpdateProgressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre à jour la progression de {selectedBookToUpdate?.title}</DialogTitle>
            <DialogDescription>
              Entrez le nombre de pages que vous avez lues pour ce livre.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pagesRead" className="text-right">
                Pages lues
              </Label>
              <Input
                id="pagesRead"
                type="number"
                value={pagesReadInput}
                onChange={(e) => setPagesReadInput(Number(e.target.value))}
                className="col-span-3"
                max={selectedBookToUpdate?.total_pages || 0}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateProgressDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveProgress}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 