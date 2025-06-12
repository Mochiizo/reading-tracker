import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  email: string;
}

export function verifyToken(request: NextRequest): { userId: string | null; error: string | null } {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return { userId: null, error: 'Authentification requise: aucun jeton fourni.' };
  }

  const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret'; // Doit correspondre à celui utilisé lors de la connexion

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    return { userId: decoded.id, error: null };
  } catch (error) {
    console.error('Erreur de vérification du jeton:', error);
    return { userId: null, error: 'Jeton invalide ou expiré.' };
  }
} 