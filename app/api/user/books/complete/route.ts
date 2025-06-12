import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  const { userId, error } = await verifyToken(request);

  if (error || !userId) {
    return NextResponse.json({ message: error || 'Non autorisé' }, { status: 401 });
  }

  try {
    const { user_book_id } = await request.json();

    if (!user_book_id) {
      return NextResponse.json({ message: 'ID du livre utilisateur est requis' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Récupérer les informations du livre utilisateur et du livre associé
      const userBookResult = await client.query(
        `SELECT
          ub.id,
          ub.user_id,
          ub.book_id,
          ub.status,
          ub.pages_read,
          b.total_pages
        FROM user_books ub
        JOIN books b ON ub.book_id = b.id
        WHERE ub.id = $1 AND ub.user_id = $2`,
        [user_book_id, userId]
      );

      const userBook = userBookResult.rows[0];

      if (!userBook) {
        return NextResponse.json({ message: 'Livre utilisateur non trouvé ou n\'appartient pas à cet utilisateur' }, { status: 404 });
      }

      if (userBook.status === 'completed') {
        return NextResponse.json({ message: 'Ce livre est déjà marqué comme terminé.' }, { status: 400 });
      }

      // Calcul des points gagnés
      let pointsEarned = 0;
      if (userBook.total_pages < 150) {
        pointsEarned = 10; // Livre court
      } else if (userBook.total_pages >= 150 && userBook.total_pages <= 300) {
        pointsEarned = 20; // Livre moyen
      } else {
        pointsEarned = 30; // Livre long
      }

      // Mettre à jour le statut du livre, les pages lues à total_pages, la progression à 100% et les points gagnés
      await client.query(
        `UPDATE user_books
         SET status = 'completed',
             pages_read = $1,
             progress_percentage = 100,
             points_earned = $2,
             completed_at = NOW(),
             updated_at = NOW()
         WHERE id = $3 AND user_id = $4`,
        [userBook.total_pages, pointsEarned, user_book_id, userId]
      );

      // Mettre à jour les points totaux et le nombre de livres lus de l'utilisateur
      await client.query(
        `UPDATE users
         SET total_points = total_points + $1,
             books_read_count = books_read_count + 1,
             updated_at = NOW()
         WHERE id = $2`,
        [pointsEarned, userId]
      );

      // Récupérer les points totaux et le niveau actuel de l'utilisateur après mise à jour
      const updatedUserStatsResult = await client.query(
        'SELECT total_points, current_level FROM users WHERE id = $1',
        [userId]
      );
      const updatedUserStats = updatedUserStatsResult.rows[0];

      if (updatedUserStats) {
        console.log('Points totaux de l\'utilisateur avant le calcul du niveau:', updatedUserStats.total_points);
        console.log('Niveau actuel de l\'utilisateur avant le calcul du niveau:', updatedUserStats.current_level);

        let newLevel = updatedUserStats.current_level; // Commencer avec le niveau actuel

        // Logique de montée de niveau : ajustez les seuils selon vos besoins
        if (updatedUserStats.total_points >= 500 && updatedUserStats.current_level < 5) {
          newLevel = 5;
        } else if (updatedUserStats.total_points >= 200 && updatedUserStats.current_level < 3) {
          newLevel = 3;
        } else if (updatedUserStats.total_points >= 50 && updatedUserStats.current_level < 2) {
          newLevel = 2;
        }
        // Ajoutez d'autres seuils de niveau ici

        console.log('Nouveau niveau calculé:', newLevel);

        if (newLevel > updatedUserStats.current_level) {
          await client.query(
            `UPDATE users
             SET current_level = $1,
                 updated_at = NOW()
             WHERE id = $2`,
            [newLevel, userId]
          );
          console.log(`Utilisateur ${userId} a atteint le niveau ${newLevel} !`);
        } else {
          console.log(`Utilisateur ${userId} reste au niveau ${newLevel}.`);
        }
      }

      // Appeler l'API de vérification des badges
      const badgeCheckResponse = await fetch('http://localhost:3000/api/user/badges/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('authorization') || '',
        },
      });
      const badgeCheckData = await badgeCheckResponse.json();
      const newlyUnlockedBadges = badgeCheckData.newlyUnlockedBadges || [];

      return NextResponse.json({ message: 'Livre marqué comme terminé avec succès !', pointsEarned, newlyUnlockedBadges }, { status: 200 });

    } catch (dbError) {
      console.error('Erreur de base de données lors du marquage du livre comme terminé:', dbError);
      return NextResponse.json({ message: 'Erreur de base de données lors du marquage du livre' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Erreur inattendue dans l'API de marquage de livre terminé:", err);
    return NextResponse.json({ message: 'Erreur inattendue lors du marquage du livre' }, { status: 500 });
  }
} 