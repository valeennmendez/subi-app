import { app } from './app.js';
import { env } from './config/env.js';
import { pool, verifyDatabaseConnection } from './config/db.js';

async function startServer() {
  try {
    await verifyDatabaseConnection();
  } catch (error) {
    console.error(
      'No se pudo conectar a la base de datos:',
      error.code ?? 'error desconocido',
    );
    await pool.end();
    process.exit(1);
  }

  app.listen(env.port, async (error) => {
    if (error) {
      console.error(
        'No se pudo iniciar el servidor:',
        error.code ?? 'error desconocido',
      );
      await pool.end();
      process.exit(1);
    }

    console.log(`Servidor escuchando en el puerto ${env.port}`);
  });
}

startServer();
