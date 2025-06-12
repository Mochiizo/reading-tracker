import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  const { userId, error } = await verifyToken(request);

  if (error || !userId) {
    return NextResponse.json({ message: error || 'Non autorisé' }, { status: 401 });
  }

  try {
    const { user_book_id, pages_read } = await request.json();

    if (!user_book_id || pages_read === undefined || pages_read < 0) {
      return NextResponse.json({ message: 'ID du livre utilisateur et pages lues sont requis' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Récupérer le nombre total de pages du livre et le statut actuel
      const userBookResult = await client.query(
        `SELECT
          ub.id,
          ub.user_id,
          ub.book_id,
          ub.status,
          ub.pages_read,
          b.total_pages,
          ub.points_earned
        FROM user_books ub
        JOIN books b ON ub.book_id = b.id
        WHERE ub.id = $1 AND ub.user_id = $2`,
        [user_book_id, userId]
      );

      const userBook = userBookResult.rows[0];

      if (!userBook) {
        return NextResponse.json({ message: 'Livre utilisateur non trouvé ou n\'appartient pas à cet utilisateur' }, { status: 404 });
      }

      const totalPages = userBook.total_pages;
      let newProgressPercentage = 0;
      if (totalPages > 0) {
        newProgressPercentage = Math.min(100, Math.round((pages_read * 100) / totalPages));
      }

      let message = 'Progression mise à jour avec succès !';
      let pointsEarned = userBook.points_earned; // Conserver les points existants par défaut
      let newlyUnlockedBadges: string[] = [];

      // Vérifier si le livre est terminé et s'il ne l'était pas déjà
      if (newProgressPercentage === 100 && userBook.status !== 'completed') {
        // Calcul des points gagnés (logique du cahier des charges)
        if (totalPages < 150) {
          pointsEarned = 10; // Livre court
        } else if (totalPages >= 150 && totalPages <= 300) {
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
          [totalPages, pointsEarned, user_book_id, userId]
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

        message = 'Livre marqué comme terminé et points attribués !';

        // Appeler l'API de vérification des badges
        const badgeCheckResponse = await fetch('http://localhost:3000/api/user/badges/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': request.headers.get('authorization') || '',
          },
        });
        const badgeCheckData = await badgeCheckResponse.json();
        newlyUnlockedBadges = badgeCheckData.newlyUnlockedBadges || [];

      } else if (newProgressPercentage < 100 || (newProgressPercentage === 100 && userBook.status === 'completed')) {
        // Si la progression est inférieure à 100% ou si le livre est déjà terminé (même à 100%)
        await client.query(
          `UPDATE user_books
           SET pages_read = $1, progress_percentage = $2, updated_at = NOW()
           WHERE id = $3 AND user_id = $4`,
          [pages_read, newProgressPercentage, user_book_id, userId]
        );
      }

      return NextResponse.json({ message, newProgressPercentage, pointsEarned, newlyUnlockedBadges }, { status: 200 });

    } catch (dbError) {
      console.error("Erreur de base de données lors de la mise à jour de la progression:", dbError);
      return NextResponse.json({ message: 'Erreur de base de données lors de la mise à jour de la progression' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Erreur inattendue dans l'API de mise à jour de progression:", err);
    return NextResponse.json({ message: 'Erreur inattendue lors de la mise à jour de la progression' }, { status: 500 });
  }
} 