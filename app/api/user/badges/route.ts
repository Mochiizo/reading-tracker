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
    const result = await client.query(
      'SELECT b.id, b.name, b.slug, b.description, b.icon, b.type, ub.earned_at FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = $1 ORDER BY ub.earned_at DESC',
      [userId]
    );
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des badges de l\'utilisateur:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
} 