# Biblioteca API

API REST para la gestión de biblioteca, libros y préstamos, construida con Node.js, Express 5, TypeScript y Mongoose.

## Requisitos

- Node.js y npm.
- MongoDB en ejecución local, en Atlas o mediante Docker.

## Instalación y configuración

1. Instalar las dependencias del proyecto.

```bash
npm install
```

2. Crear el archivo `.env` a partir de `.env.example` y completar las variables requeridas.

```bash
cp .env.example .env
```

| Variable         | Requerida | Descripción                                                | Valor por defecto      |
| ---------------- | --------- | ---------------------------------------------------------- | ---------------------- |
| `PORT`           | Sí        | Puerto HTTP del servidor                                   | `3000`                 |
| `MONGO_URI`           | Sí        | Cadena de conexión a MongoDB                               | `-`                    |
| `MONGO_ROOT_USER`     | Docker    | Usuario root de MongoDB para `docker-compose.yml`          | `-`                    |
| `MONGO_ROOT_PASSWORD` | Docker    | Contraseña root de MongoDB para `docker-compose.yml`       | `-`                    |
| `JWT_SECRET`          | Sí        | Clave secreta para firmar JWT (mínimo 32 caracteres)       | `-`                    |
| `JWT_EXPIRES_IN` | No        | Duración del token de acceso                               | `15m`                  |
| `JWT_ISSUER`     | No        | Emisor del token JWT                                       | `devlights-api`        |
| `JWT_AUDIENCE`   | No        | Audiencia del token JWT                                    | `devlights-api-client` |
| `NODE_ENV`       | No        | Entorno de ejecución (`development`, `test`, `production`) | `development`          |
| `ADMIN_EMAIL`    | Solo seed | Email del usuario administrador inicial                    | `-`                    |
| `ADMIN_PASSWORD` | Solo seed | Contraseña del admin inicial (mínimo 8 caracteres)         | `-`                    |

3. Levantar MongoDB con Docker Compose si no tenés una instancia local o en Atlas.

```bash
docker compose up -d
```

4. Crear el usuario administrador inicial y cargar el catálogo de libros de ejemplo. Ambos seeds son idempotentes: se pueden ejecutar varias veces sin duplicar datos (requiere `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `.env`).

```bash
npm run seed
```

Para ejecutar solo uno de los seeds:

```bash
npm run seed:admin
npm run seed:books
```

## Ejecución y pruebas

- Iniciar en modo desarrollo con recarga automática en `http://localhost:3000`:

```bash
npm run dev
```

- Compilar TypeScript y ejecutar la versión compilada:

```bash
npm run build
npm start
```

## Endpoints

Todas las rutas de negocio usan el prefijo `/api/v1`. Las rutas protegidas requieren el encabezado `Authorization: Bearer <token>`.

### Salud del servicio

| Método | Ruta      | Acceso  | Descripción                                            |
| ------ | --------- | ------- | ------------------------------------------------------ |
| `GET`  | `/health` | Público | Verifica el estado de la API y la conexión con MongoDB |

### Autenticación

| Método | Ruta                    | Acceso      | Descripción                                              |
| ------ | ----------------------- | ----------- | -------------------------------------------------------- |
| `POST` | `/api/v1/auth/register` | Público     | Registra un usuario nuevo y devuelve sus datos con token |
| `POST` | `/api/v1/auth/login`    | Público     | Inicia sesión con email y contraseña y devuelve un JWT   |
| `GET`  | `/api/v1/auth/me`       | Autenticado | Devuelve el perfil del usuario autenticado               |
| `POST` | `/api/v1/auth/logout`   | Autenticado | Cierra la sesión actual                                  |

### Libros

`GET /api/v1/books` admite filtros y paginación por query (`page`, `limit`, `genre`, `author`, `available`, `year`, `yearFrom`, `yearTo`, `search`, `sortBy`, `order`).

| Método   | Ruta                | Acceso  | Descripción                           |
| -------- | ------------------- | ------- | ------------------------------------- |
| `GET`    | `/api/v1/books`     | Público | Lista libros con filtros y paginación |
| `GET`    | `/api/v1/books/:id` | Público | Obtiene un libro por su ID            |
| `POST`   | `/api/v1/books`     | Admin   | Crea un libro nuevo                   |
| `PUT`    | `/api/v1/books/:id` | Admin   | Actualiza un libro existente          |
| `DELETE` | `/api/v1/books/:id` | Admin   | Elimina un libro disponible           |

### Préstamos

`GET /api/v1/loans` admite filtros y paginación por query (`page`, `limit`, `status`, `bookId`).

| Método  | Ruta                       | Acceso      | Descripción                                            |
| ------- | -------------------------- | ----------- | ------------------------------------------------------ |
| `GET`   | `/api/v1/loans`            | Autenticado | Lista préstamos propios o todos si el usuario es admin |
| `GET`   | `/api/v1/loans/:id`        | Autenticado | Obtiene un préstamo por su ID                          |
| `POST`  | `/api/v1/loans`            | Autenticado | Crea un préstamo y marca el libro como no disponible   |
| `PATCH` | `/api/v1/loans/:id/return` | Autenticado | Registra la devolución del libro prestado              |

## Colección de Thunder Client

El repositorio incluye el archivo `thunder-collection_Devlights API.json` en la raíz del proyecto. Podés importarlo desde Thunder Client para probar los 19 requests organizados en las carpetas `Health`, `Auth`, `Books`, `Loans` y `Error Cases`, con base URL `http://localhost:3000` y cuerpos JSON de ejemplo.

La carpeta `Error Cases` cubre los escenarios de falla exigidos: `400` por body inválido y por ID con formato incorrecto, `401` por token ausente e inválido, `403` por intentar eliminar un libro sin rol admin, y `404` por recurso inexistente.

Antes de ejecutar los requests autenticados, iniciá sesión con `Login` y guardá el `accessToken` de la respuesta en la variable de colección `token`.

## Manejo de errores en controladores

Cada controlador envuelve su lógica en `try/catch` y deriva cualquier excepción al middleware global `errorHandler` de `src/middlewares/error.middleware.ts` mediante `next(error)`. Ese middleware traduce los errores de dominio (`HttpError`) a los códigos 400, 401, 403, 404 y 409, y cualquier error inesperado a 500, sin filtrar detalles internos en producción. Express 5 además captura promesas rechazadas, por lo que un error no atrapado termina en el mismo middleware.
