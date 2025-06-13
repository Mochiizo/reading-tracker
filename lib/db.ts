import { Pool } from 'pg';

/**
 * Configuration et initialisation de la connexion à la base de données PostgreSQL
 * Utilise un pool de connexions pour gérer efficacement les connexions multiples
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Export du pool de connexions pour être utilisé dans toute l'application
export default pool; 