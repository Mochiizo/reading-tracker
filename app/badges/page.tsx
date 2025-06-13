'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/app/providers/auth-provider';
import { useRouter } from 'next/navigation';

/**
 * Interface définissant la structure d'un badge
 */
interface Badge {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  type: string;
  criteria: any; // Ajustez ce type si vous avez un schéma plus spécifique
}

/**
 * Interface étendant Badge pour inclure la date d'obtention
 */
interface UserBadge extends Badge {
  earned_at: string;
}

/**
 * Page des badges de l'application
 * Affiche tous les badges disponibles et ceux débloqués par l'utilisateur
 * Permet de filtrer et rechercher les badges
 */
const BadgesPage = () => {
  // États pour gérer les badges, le chargement et les filtres
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'
  const [searchTerm, setSearchTerm] = useState('');

  const { token } = useAuth();
  const router = useRouter();

  /**
   * Effet pour charger les badges au montage du composant
   * Récupère tous les badges et les badges de l'utilisateur
   */
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        // Récupération de tous les badges disponibles
        const allBadgesRes = await fetch('/api/badges');
        if (!allBadgesRes.ok) {
          throw new Error(`Erreur lors de la récupération de tous les badges: ${allBadgesRes.statusText}`);
        }
        const allBadgesData: Badge[] = await allBadgesRes.json();
        setAllBadges(allBadgesData);

        // Récupération des badges de l'utilisateur (nécessite une authentification)
        const userBadgesRes = await fetch('/api/user/badges');
        if (!userBadgesRes.ok) {
          // Redirection si non autorisé
          if (userBadgesRes.status === 401) {
            router.push('/login');
          }
          throw new Error(`Erreur lors de la récupération des badges de l\'utilisateur: ${userBadgesRes.statusText}`);
        }
        const userBadgesData: UserBadge[] = await userBadgesRes.json();
        setUserBadges(userBadgesData);

      } catch (err: any) {
        console.error("Erreur lors du chargement des badges:", err);
        setError(err.message || 'Une erreur est survenue lors du chargement des badges.');
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [token, router]);

  // Création d'un Set des IDs des badges débloqués pour une recherche rapide
  const userUnlockedBadgeIds = new Set(userBadges.map(badge => badge.id));

  /**
   * Filtre les badges selon les critères de recherche et le filtre sélectionné
   */
  const filteredBadges = allBadges.filter(badge => {
    const isUnlocked = userUnlockedBadgeIds.has(badge.id);
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          badge.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'unlocked') {
      return isUnlocked;
    } else if (filter === 'locked') {
      return !isUnlocked;
    } else {
      return true; // 'all'
    }
  });

  // Affichage pendant le chargement
  if (loading) {
    return <div className="container mx-auto p-4 text-center">Chargement des badges...</div>;
  }

  // Affichage en cas d'erreur
  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Vos Badges</h1>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Rechercher un badge..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:flex-1"
        />
        <div className="flex gap-2">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
          >
            Tous
          </Button>
          <Button
            onClick={() => setFilter('unlocked')}
            variant={filter === 'unlocked' ? 'default' : 'outline'}
          >
            Débloqués
          </Button>
          <Button
            onClick={() => setFilter('locked')}
            variant={filter === 'locked' ? 'default' : 'outline'}
          >
            Verrouillés
          </Button>
        </div>
      </div>

      {/* Grille des badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.length > 0 ? (
          filteredBadges.map((badge) => {
            const isUnlocked = userUnlockedBadgeIds.has(badge.id);
            const earnedAt = userBadges.find(ub => ub.id === badge.id)?.earned_at;
            const dateEarned = earnedAt ? new Date(earnedAt).toLocaleDateString('fr-FR') : null;

            return (
              <Card key={badge.id} className={isUnlocked ? "" : "opacity-50 grayscale"}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {badge.icon && <span dangerouslySetInnerHTML={{ __html: badge.icon }} />}
                    {badge.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{badge.description}</p>
                  {isUnlocked && dateEarned && (
                    <p className="text-sm text-muted-foreground mt-2">Débloqué le: {dateEarned}</p>
                  )}
                  {!isUnlocked && (
                    <p className="text-sm text-muted-foreground mt-2">Débloquez ce badge pour gagner des points !</p>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p className="col-span-full text-center text-muted-foreground">Aucun badge trouvé avec ces critères.</p>
        )}
      </div>
    </div>
  );
};

export default BadgesPage; 