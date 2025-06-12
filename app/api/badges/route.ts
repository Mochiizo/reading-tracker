import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id, name, slug, description, icon, type, criteria FROM badges WHERE is_active = TRUE ORDER BY name');
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des badges:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
} 