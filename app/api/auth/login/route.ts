import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email et mot de passe sont requis' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, password, name FROM users WHERE email = $1',
        [email]
      );
      const user = result.rows[0];

      if (!user) {
        return NextResponse.json({ message: 'Email ou mot de passe incorrect' }, { status: 401 });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return NextResponse.json({ message: 'Email ou mot de passe incorrect' }, { status: 401 });
      }

      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        throw new Error('JWT_SECRET n\'est pas défini dans les variables d\'environnement.');
      }

      const token = await new SignJWT({
        sub: user.id,
        email: user.email,
        name: user.name,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('2h')
        .sign(new TextEncoder().encode(jwtSecret));

      const cookieStore = await cookies();
      cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 2,
      });

      return NextResponse.json(
        { message: 'Connexion réussie', user: { id: user.id, email: user.email, name: user.name } },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur lors de la connexion de l'utilisateur:", error);
      return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json({ message: 'Erreur inattendue lors du traitement de la requête' }, { status: 500 });
  }
} 