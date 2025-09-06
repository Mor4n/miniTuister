# API Gateway

Este servicio actúa como puerta de entrada para todos los microservicios.

## Endpoints proxy

- `/tweets` y subrutas → tweet-service (http://localhost:3001)
- `/users` y subrutas  → tweet-service (http://localhost:3001)

Puedes agregar más rutas para otros microservicios.

## Uso

1. Instala dependencias:
   ```sh
   npm install
   ```
2. Inicia el gateway:
   ```sh
   npm start
   ```
3. El frontend debe hacer peticiones a `http://localhost:3000/tweets`, etc.
