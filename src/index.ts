import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const { PORT } = env;

await connectDatabase();

const app = createApp();

app.listen(PORT, () => {
  console.log(`API de Biblioteca escuchando en http://localhost:${PORT}`);
});
