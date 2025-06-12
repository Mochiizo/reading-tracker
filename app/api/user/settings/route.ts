import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { userId, error } = verifyToken(request);

  if (error || !userId) {
    return NextResponse.json({ message: error || 'Non autorisé' }, { status: 401 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [userId]
    );
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur de base de données lors de la récupération des informations utilisateur:', err);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la récupération des informations utilisateur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { userId, error } = verifyToken(request);

  if (error || !userId) {
    return NextResponse.json({ message: error || 'Non autorisé' }, { status: 401 });
  }

  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ message: 'Le nom et l\'email sont requis.' }, { status: 400 });
    }

    const client = await pool.connect();
    const updateResult = await client.query(
      'UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email',
      [name, email, userId]
    );
    client.release();

    if (updateResult.rows.length === 0) {
      return NextResponse.json({ message: 'Utilisateur non trouvé ou informations non mises à jour.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Informations utilisateur mises à jour avec succès.', user: updateResult.rows[0] });

  } catch (err) {
    console.error('Erreur de base de données lors de la mise à jour des informations utilisateur:', err);
    return NextResponse.json({ message: 'Erreur interne du serveur lors de la mise à jour des informations utilisateur' }, { status: 500 });
  }
} 