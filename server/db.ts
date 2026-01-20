export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const connectionString = process.env.DATABASE_URL;
      _db = drizzle({
        connection: {
          uri: connectionString,
          ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
          }
        }
      });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
