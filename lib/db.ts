import { Pool } from 'pg';

/**
 * Configuration et initialisation de la connexion à la base de données PostgreSQL
 * Utilise un pool de connexions pour gérer efficacement les connexions multiples
 */
const pool = new Pool({
  user: 'postgres',      // Nom d'utilisateur de la base de données
  host: 'localhost',     // Hôte de la base de données
  database: 'DB_READING_TRACKER', // Nom de la base de données
  password: 'postgres',  // Mot de passe (à remplacer par une valeur sécurisée en production)
  port: 5432,           // Port par défaut de PostgreSQL
});

// Export du pool de connexions pour être utilisé dans toute l'application
export default pool; 