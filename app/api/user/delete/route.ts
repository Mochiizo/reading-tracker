import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

/**
 * Endpoint pour la suppression du compte utilisateur
 * Supprime toutes les données associées à l'utilisateur
 */
export async function DELETE(request: Request) {
  try {
    // Vérification de l'authentification
    const { userId, error } = await verifyToken(request as any);
    if (error || !userId) {
      return NextResponse.json(
        { message: error || 'Non autorisé' },
        { status: 401 }
      );
    }

    // Suppression de toutes les données associées à l'utilisateur
    await pool.query('BEGIN');

    try {
      // Suppression des badges de l'utilisateur
      await pool.query('DELETE FROM user_badges WHERE user_id = $1', [userId]);
      
      // Suppression des livres de l'utilisateur
      await pool.query('DELETE FROM user_books WHERE user_id = $1', [userId]);
      
      // Suppression des statistiques de l'utilisateur
      await pool.query('DELETE FROM user_stats WHERE user_id = $1', [userId]);
      
      // Suppression de l'utilisateur
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);

      await pool.query('COMMIT');

      // Réponse de succès
      return NextResponse.json(
        { message: 'Compte supprimé avec succès' },
        { status: 200 }
      );
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du compte' },
      { status: 500 }
    );
  }
} 