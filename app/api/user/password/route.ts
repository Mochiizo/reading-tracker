import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function PUT(request: Request) {
  try {
    // Récupérer le token depuis les cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    console.log('Token reçu dans l\'API password:', token);

    if (!token) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier le token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    let payload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(token, secret);
      payload = verifiedPayload;
    } catch (jwtError) {
      console.error('Erreur de vérification JWT:', jwtError);
      return NextResponse.json(
        { message: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    const userId = payload.sub;

    if (!userId) {
      return NextResponse.json(
        { message: 'Token invalide: ID utilisateur manquant' },
        { status: 401 }
      );
    }

    // Récupérer les données de la requête
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Mot de passe actuel et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    // Récupérer le mot de passe actuel de l'utilisateur
    const result = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const hashedPassword = result.rows[0].password;

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, hashedPassword);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Mot de passe actuel incorrect' },
        { status: 401 }
      );
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedNewPassword, userId]
    );

    return NextResponse.json(
      { message: 'Mot de passe modifié avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la modification du mot de passe:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la modification du mot de passe' },
      { status: 500 }
    );
  }
} 