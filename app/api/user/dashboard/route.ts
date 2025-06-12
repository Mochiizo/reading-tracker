import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { userId, error } = await verifyToken(request);

  if (error || !userId) {
    return NextResponse.json({ message: error || 'Non autorisé' }, { status: 401 });
  }

  try {
    const client = await pool.connect();
    try {
      // Récupérer les informations de l'utilisateur
      const userResult = await client.query(
        'SELECT id, name, email, total_points, current_level, books_read_count FROM users WHERE id = $1',
        [userId]
      );
      const user = userResult.rows[0];

      if (!user) {
        return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
      }

      // Récupérer les livres de l'utilisateur
      const booksResult = await client.query(
        `SELECT
          ub.id AS user_book_id,
          b.id AS book_id,
          b.title,
          b.author,
          c.name AS category,
          ub.status,
          ub.pages_read,
          b.total_pages,
          ub.points_earned,
          ub.progress_percentage AS progress
        FROM user_books ub
        JOIN books b ON ub.book_id = b.id
        JOIN categories c ON b.category_id = c.id
        WHERE ub.user_id = $1 AND ub.status != 'completed'
        ORDER BY ub.completed_at DESC, ub.started_at DESC`,
        [userId]
      );
      const books = booksResult.rows;

      // Récupérer les badges de l'utilisateur
      const badgesResult = await client.query(
        `SELECT
          b.id,
          b.name,
          b.description,
          b.icon
        FROM user_badges ub
        JOIN badges b ON ub.badge_id = b.id
        WHERE ub.user_id = $1
        ORDER BY ub.earned_at DESC`,
        [userId]
      );
      const badges = badgesResult.rows;

      return NextResponse.json({ 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          total_points: user.total_points,
          current_level: user.current_level,
          books_read_count: user.books_read_count,
          books: books,
          badges: badges,
        }
      }, { status: 200 });

    } catch (dbError) {
      console.error('Erreur de base de données lors de la récupération du tableau de bord:', dbError);
      return NextResponse.json({ message: 'Erreur de base de données' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Erreur inattendue dans l'API du tableau de bord:", err);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
} 