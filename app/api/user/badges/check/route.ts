import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Vérification de l'authentification de l'utilisateur
  const { userId, error } = await verifyToken(request);

  if (error || !userId) {
    return NextResponse.json({ message: error || 'Non autorisé' }, { status: 401 });
  }

  try {
    // Connexion à la base de données
    const client = await pool.connect();
    try {
      // Récupération des statistiques de l'utilisateur (points, livres lus, niveau)
      const userStatsResult = await client.query(
        'SELECT total_points, books_read_count, current_level FROM users WHERE id = $1',
        [userId]
      );
      const userStats = userStatsResult.rows[0];

      if (!userStats) {
        return NextResponse.json({ message: 'Utilisateur non trouvé.' }, { status: 404 });
      }

      // Récupération parallèle des badges actifs et des badges déjà débloqués par l'utilisateur
      const [allBadgesResult, userBadgesResult] = await Promise.all([
        client.query('SELECT id, name, slug, description, type, criteria FROM badges WHERE is_active = TRUE'),
        client.query('SELECT badge_id FROM user_badges WHERE user_id = $1', [userId])
      ]);

      const allBadges = allBadgesResult.rows;
      const userUnlockedBadgeIds = new Set(userBadgesResult.rows.map(row => row.badge_id));

      // Logs pour le débogage
      console.log('UserID pour vérification des badges:', userId);
      console.log('Tous les badges actifs:', allBadges);
      console.log('Badges débloqués par l\'utilisateur (IDs):', Array.from(userUnlockedBadgeIds));

      const newlyUnlockedBadges = [];

      // Vérification de chaque badge pour l'utilisateur
      for (const badge of allBadges) {
        // Vérifie si le badge n'est pas déjà débloqué
        if (!userUnlockedBadgeIds.has(badge.id)) {
          let unlocked = false;

          // Vérification des conditions spécifiques pour chaque type de badge
          switch (badge.slug) {
            case 'premiere-lecture':
              unlocked = userStats.books_read_count >= 1;
              break;
            case 'lecteur-assidue':
              unlocked = userStats.books_read_count >= 5;
              break;
            case 'bibliophile':
              unlocked = userStats.books_read_count >= 20;
              break;
            case 'marathon-lecture':
              // Vérifie si l'utilisateur a lu au moins un livre de plus de 300 pages
              const marathonBookCountResult = await client.query(
                `SELECT COUNT(DISTINCT ub.book_id)
                 FROM user_books ub
                 JOIN books b ON ub.book_id = b.id
                 WHERE ub.user_id = $1 AND ub.status = 'completed' AND b.total_pages > 300`,
                [userId]
              );
              console.log('Résultat de la requête Marathon de lecture:', marathonBookCountResult.rows[0].count);
              unlocked = marathonBookCountResult.rows[0].count > 0;
              break;
            case 'devoreur-paves':
              // Vérifie si l'utilisateur a lu au moins un livre de plus de 500 pages
              const devoreurPavesCountResult = await client.query(
                `SELECT COUNT(DISTINCT ub.book_id)
                 FROM user_books ub
                 JOIN books b ON ub.book_id = b.id
                 WHERE ub.user_id = $1 AND ub.status = 'completed' AND b.total_pages > 500`,
                [userId]
              );
              console.log('Résultat de la requête Dévorateur de pavés:', devoreurPavesCountResult.rows[0].count);
              unlocked = devoreurPavesCountResult.rows[0].count > 0;
              break;
            case 'niveau-expert':
              unlocked = userStats.current_level >= 5;
              break;
            default:
              break;
          }

          // Si le badge est débloqué, on l'ajoute à la base de données et à la liste des nouveaux badges
          if (unlocked) {
            console.log(`Badge débloqué: ${badge.name} (ID: ${badge.id})`);
            await client.query(
              'INSERT INTO user_badges (user_id, badge_id, earned_at, created_at, updated_at) VALUES ($1, $2, NOW(), NOW(), NOW())',
              [userId, badge.id]
            );
            newlyUnlockedBadges.push(badge.name);
          }
        }
      }

      return NextResponse.json({ message: 'Vérification des badges terminée.', newlyUnlockedBadges }, { status: 200 });

    } catch (dbError) {
      // Gestion des erreurs de base de données
      console.error('Erreur de base de données lors de la vérification des badges:', dbError);
      return NextResponse.json({ message: 'Erreur de base de données lors de la vérification des badges' }, { status: 500 });
    } finally {
      // Libération de la connexion à la base de données
      client.release();
    }
  } catch (err) {
    // Gestion des erreurs générales
    console.error('Erreur inattendue dans l\'API de vérification des badges:', err);
    return NextResponse.json({ message: 'Erreur inattendue lors de la vérification des badges' }, { status: 500 });
  }
} 