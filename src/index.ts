import { createApp } from './app.js';
import { env } from './config/env.js';

const { PORT } = env;

const app = createApp();

app.listen(PORT, () => {
  console.log(`API de Biblioteca escuchando en http://localhost:${PORT}`);
});
