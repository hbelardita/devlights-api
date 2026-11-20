import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

const { PORT } = env;

const startServer = async () => {
  const app = createApp();
  await connectDatabase();

  const server = app.listen(PORT, () => {
    console.log(`API de Biblioteca escuchando en http://localhost:${PORT}`);
  });

  let shuttingDown = false;

  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;

    const timeout = setTimeout(() => {
      console.error(
        'Tiempo límite para el cierre ordenado. Forzando la salida.',
      );
      server.closeAllConnections();
      process.exit(1);
    }, 10000);

    try {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      console.log('servidor HTTP cerrado.');

      await disconnectDatabase();
      console.log('MongoDB desconectado.');

      process.exitCode = 0;
    } catch (error) {
      console.error('Error de apagado:', error);
      process.exitCode = 1;
    } finally {
      clearTimeout(timeout);
    }
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
};

startServer().catch((error) => {
  console.error('Error al iniciar la aplicación:', error);
  process.exit(1);
});
