import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    try {
      const { payload } = await jwtVerify(token, secret);

      // Assurez-vous que les informations utilisateur sont extraites et retournées
      // selon ce que vous avez mis dans le payload lors de la signature du JWT
      const user = {
        id: payload.sub as string,
        email: payload.email as string,
        name: payload.name as string,
        avatar: payload.avatar as string | undefined, // Si vous avez un avatar dans le payload
      };

      return NextResponse.json({ isAuthenticated: true, user }, { status: 200 });
    } catch (error) {
      console.error('Erreur de vérification du token de session:', error);
      // Si le token est invalide ou expiré, on retourne que l'utilisateur n'est pas authentifié
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }
  } catch (error) {
    console.error('Erreur inattendue dans l\'API de session:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 