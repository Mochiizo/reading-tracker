import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

/**
 * Interface définissant la structure du payload JWT
 * @interface JwtPayload
 */
interface JwtPayload {
  sub: string;    // ID de l'utilisateur
  email: string;  // Email de l'utilisateur
  name: string;   // Nom de l'utilisateur
}

/**
 * Vérifie la validité du token JWT et extrait l'ID de l'utilisateur
 * @param {NextRequest} request - La requête HTTP entrante
 * @returns {Promise<{userId: string | null, error: string | null}>} - L'ID de l'utilisateur et une éventuelle erreur
 */
export async function verifyToken(request: NextRequest): Promise<{ userId: string | null; error: string | null }> {
  // Récupération du token depuis les cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // Vérification de la présence du token
  if (!token) {
    return { userId: null, error: 'Authentification requise: aucun jeton fourni.' };
  }

  // Vérification de la présence de la clé secrète JWT
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return { userId: null, error: 'JWT_SECRET n\'est pas défini dans les variables d\'environnement.' };
  }

  try {
    // Vérification et décodage du token
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    
    // Vérification de la présence de l'ID utilisateur dans le payload
    if (!payload.sub) {
      return { userId: null, error: 'Jeton invalide: ID utilisateur manquant.' };
    }

    return { userId: payload.sub as string, error: null };
  } catch (error) {
    // Gestion des erreurs de vérification du token
    console.error('Erreur de vérification du jeton:', error);
    return { userId: null, error: 'Jeton invalide ou expiré.' };
  }
} 