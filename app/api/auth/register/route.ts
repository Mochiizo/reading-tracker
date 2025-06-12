import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Le nom, email et mot de passe sont requis' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, email',
        [name, email, hashedPassword]
      );
      const user = result.rows[0];
      return NextResponse.json({ message: 'Utilisateur enregistré avec succès', user }, { status: 201 });
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation error code for PostgreSQL
        return NextResponse.json({ message: 'Cet email est déjà utilisé' }, { status: 409 });
      }
      console.error("Erreur lors de l'enregistrement de l'utilisateur:", error);
      return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json({ message: 'Erreur inattendue lors du traitement de la requête' }, { status: 500 });
  }
} 