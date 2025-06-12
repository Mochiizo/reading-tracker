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
      const completedBooksResult = await client.query(
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
          ub.progress_percentage AS progress,
          ub.completed_at
        FROM user_books ub
        JOIN books b ON ub.book_id = b.id
        JOIN categories c ON b.category_id = c.id
        WHERE ub.user_id = $1 AND ub.status = 'completed'
        ORDER BY ub.completed_at DESC`,
        [userId]
      );
      const completedBooks = completedBooksResult.rows;

      return NextResponse.json({ books: completedBooks }, { status: 200 });
    } catch (dbError) {
      console.error('Erreur de base de données lors de la récupération des livres terminés:', dbError);
      return NextResponse.json({ message: 'Erreur de base de données' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Erreur inattendue dans l\'API des livres terminés:', err);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
} 