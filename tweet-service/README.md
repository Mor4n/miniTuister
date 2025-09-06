# Tweet Service

Microservicio para gestionar tweets usando Supabase como base de datos.

## Endpoints

 - `GET    /tweets`                 → Lista todos los tweets
 - `POST   /tweets`                 → Crea un tweet (`user_id`, `content`)
 - `GET    /users/:user_id/tweets`  → Lista los tweets de un usuario
 - `POST   /tweets/:tweet_id/like`  → Da like a un tweet (`user_id`)
 - `GET    /tweets/:tweet_id/likes` → Cuenta los likes de un tweet
 - `POST   /tweets/:tweet_id/reply` → Responde a un tweet (`user_id`, `content`)
 - `GET    /tweets/:tweet_id/replies` → Lista las respuestas a un tweet
 - `DELETE /tweets/:tweet_id`         → Borra un tweet

## Configuración

1. Copia `.env.example` a `.env` y pon tus claves de Supabase.
2. Instala dependencias:
   ```sh
   npm install
   ```
3. Inicia el microservicio:
   ```sh
   npm start
   ```
