import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT id, name FROM categories ORDER BY name ASC');
      return NextResponse.json(result.rows, { status: 200 });
    } catch (dbError) {
      console.error('Erreur de base de données lors de la récupération des catégories:', dbError);
      return NextResponse.json({ message: 'Erreur de base de données' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur inattendue lors de la récupération des catégories:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
} 