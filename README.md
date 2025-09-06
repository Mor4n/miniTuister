# miniTuister - Microservicios

Este proyecto es un clon didáctico de Twitter usando arquitectura de microservicios, Node.js y React.

## ¿Cómo funciona?

- Cada microservicio es una app Node.js independiente (ej: tweet-service, auth-service, etc).
- El **API Gateway** recibe todas las peticiones del frontend y las redirige al microservicio correspondiente.
- El frontend (React) solo se comunica con el API Gateway.

## Estructura del proyecto

- `/frontend`         → Aplicación React (cliente)
- `/tweet-service`    → Microservicio para tweets, likes y respuestas
- `/api-gateway`      → API Gateway (puerta de entrada a todos los microservicios)
- `/auth-service`     → (Ejemplo) Microservicio para autenticación (puedes agregar más)

## ¿Cómo correr el proyecto?

1. Instala dependencias en la raíz y en cada microservicio:
	```sh
	npm install
	cd tweet-service && npm install
	cd ../api-gateway && npm install
	# (Haz lo mismo en cada microservicio nuevo)
	```
2. Arranca todos los microservicios y el gateway a la vez (desde la raíz):
	```sh
	npm run start:all
	```
3. Arranca el frontend:
	```sh
	cd frontend
	npm install
	npm run dev
	```

## ¿Cómo agregar un nuevo microservicio?

1. Crea una carpeta nueva (ej: `profile-service`).
2. Haz un `package.json` y un archivo principal (`app.js`).
3. Agrega los endpoints que necesites.
4. Instala dependencias y arráncalo en un puerto diferente.
5. Agrega una ruta en el API Gateway para redirigir las peticiones a este nuevo microservicio.

## ¿Cómo colaborar?

- Cada quien puede trabajar en su microservicio sin afectar a los demás.
- El API Gateway es el punto de integración.
- El frontend solo habla con el gateway, nunca directo con los microservicios.

## Documentación y ejemplos

- Cada microservicio tiene un `README.md` con endpoints y cómo correrlo.
- El API Gateway también tiene su propio `README.md`.
- El frontend tiene ejemplos de cómo consumir los endpoints.

## Requisitos

- Node.js y npm instalados.
- Acceso a las claves de Supabase (en `.env` de cada microservicio que lo use).

---
¡Listo para colaborar y escalar el proyecto!
# miniTuister
Proyecto de microservicios para la materia Sistemas Integrales II
