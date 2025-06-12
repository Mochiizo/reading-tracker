import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

export async function verifyToken(request: NextRequest): Promise<{ userId: string | null; error: string | null }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return { userId: null, error: 'Authentification requise: aucun jeton fourni.' };
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return { userId: null, error: 'JWT_SECRET n\'est pas défini dans les variables d\'environnement.' };
  }

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    
    // Assurez-vous que le payload a bien un sub (userId)
    if (!payload.sub) {
      return { userId: null, error: 'Jeton invalide: ID utilisateur manquant.' };
    }

    return { userId: payload.sub as string, error: null };
  } catch (error) {
    console.error('Erreur de vérification du jeton:', error);
    return { userId: null, error: 'Jeton invalide ou expiré.' };
  }
} 