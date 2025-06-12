import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token'); // Supprimer le cookie du token

    return NextResponse.json({ message: 'Déconnexion réussie' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur lors de la déconnexion' },
      { status: 500 }
    );
  }
} 