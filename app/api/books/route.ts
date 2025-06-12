import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { userId, error } = verifyToken(request);

  if (error || !userId) {
    return NextResponse.json({ message: error || 'Non autorisé' }, { status: 401 });
  }

  try {
    const { title, author, total_pages, category_id } = await request.json();

    if (!title || !author || !total_pages || !category_id) {
      return NextResponse.json({ message: 'Tous les champs du livre sont requis' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Insérer le livre dans la table 'books'
      const bookResult = await client.query(
        'INSERT INTO books (title, author, total_pages, category_id, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
        [title, author, total_pages, category_id]
      );
      const newBookId = bookResult.rows[0].id;

      // Lier le livre à l'utilisateur dans la table 'user_books'
      await client.query(
        'INSERT INTO user_books (user_id, book_id, pages_read, progress_percentage, status, started_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())',
        [userId, newBookId, 0, 0, 'reading'] // Statut initial: en cours, 0 pages lues, 0% progression
      );

      return NextResponse.json({ message: 'Livre ajouté avec succès !', bookId: newBookId }, { status: 201 });
    } catch (dbError) {
      console.error('Erreur de base de données lors de l\'ajout du livre:', dbError);
      return NextResponse.json({ message: 'Erreur de base de données lors de l\'ajout du livre' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Erreur inattendue dans l\'API d\'ajout de livre:', err);
    return NextResponse.json({ message: 'Erreur inattendue lors de l\'ajout du livre' }, { status: 500 });
  }
} 