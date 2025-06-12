import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email et mot de passe sont requis' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, password FROM users WHERE email = $1',
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

      // Assurez-vous d'avoir une variable d'environnement pour votre secret JWT
      const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret'; // À remplacer par une vraie clé secrète
      const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });

      return NextResponse.json({ message: 'Connexion réussie', token, user: { id: user.id, email: user.email } }, { status: 200 });
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