import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { userId, error } = verifyToken(request);

  if (error || !userId) {
    return NextResponse.json({ message: error || 'Non autorisé' }, { status: 401 });
  }

  try {
    const client = await pool.connect();
    try {
      // Récupérer les statistiques actuelles de l'utilisateur
      const userStatsResult = await client.query(
        'SELECT total_points, books_read_count, current_level FROM users WHERE id = $1',
        [userId]
      );
      const userStats = userStatsResult.rows[0];

      if (!userStats) {
        return NextResponse.json({ message: 'Utilisateur non trouvé.' }, { status: 404 });
      }

      // Récupérer tous les badges actifs et les badges déjà débloqués par l'utilisateur
      const [allBadgesResult, userBadgesResult] = await Promise.all([
        client.query('SELECT id, name, slug, description, type, criteria FROM badges WHERE is_active = TRUE'),
        client.query('SELECT badge_id FROM user_badges WHERE user_id = $1', [userId])
      ]);

      const allBadges = allBadgesResult.rows;
      const userUnlockedBadgeIds = new Set(userBadgesResult.rows.map(row => row.badge_id));

      console.log('UserID pour vérification des badges:', userId);
      console.log('Tous les badges actifs:', allBadges);
      console.log('Badges débloqués par l\'utilisateur (IDs):', Array.from(userUnlockedBadgeIds));

      const newlyUnlockedBadges = [];

      for (const badge of allBadges) {
        if (!userUnlockedBadgeIds.has(badge.id)) {
          // Logique de vérification pour chaque type de badge
          let unlocked = false;

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
            // Ajoutez d'autres cas pour d'autres types de badges
            default:
              break;
          }

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
      console.error('Erreur de base de données lors de la vérification des badges:', dbError);
      return NextResponse.json({ message: 'Erreur de base de données lors de la vérification des badges' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Erreur inattendue dans l\'API de vérification des badges:', err);
    return NextResponse.json({ message: 'Erreur inattendue lors de la vérification des badges' }, { status: 500 });
  }
} 