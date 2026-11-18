import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const { PORT } = env;

const startServer = async () => {
  const app = createApp();
  await connectDatabase();

  const server = app.listen(PORT, () => {
    console.log(`API de Biblioteca escuchando en http://localhost:${PORT}`);
  });

  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;

    const timeout = setTimeout(() => {
      console.error(
        "Tiempo límite para el cierre ordenado. Forzando la salida.",
      );
      server.closeAllConnections();
      process.exit(1);
    }, 10000);

    try {
      server.close(async (error) => {
        try {
          if (error) {
            throw error;
          }

          console.log("servidor HTTP cerrado.");

          await disconnectDatabase();

          console.log("MongoDB desconectado.");

          clearTimeout(timeout);
          process.exitCode = 0;
        } catch (error) {
          console.error("Error de apagado:", error);
          clearTimeout(timeout);
          process.exitCode = 1;
        }
      });
    } catch (error) {
      console.error("Error de apagado:", error);
      clearTimeout(timeout);
      process.exitCode = 1;
    }
  };

  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  process.once("SIGINT", () => void shutdown("SIGINT"));
};

startServer().catch((error) => {
  console.error("Error al iniciar la aplicación:", error);
  process.exit(1);
});
