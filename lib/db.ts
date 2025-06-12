import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DB_READING_TRACKER',
  password: 'postgres', // À remplacer par votre mot de passe
  port: 5432,
});

export default pool; 