# MiniTuister - Microservices Architecture Migration

## 🎯 Migración Completada: User-Service 

Hemos migrado exitosamente toda la funcionalidad relacionada con usuarios desde `tweet-service` hacia `user-service` para una mejor separación de responsabilidades en la arquitectura de microservicios.

## 📋 ¿Qué se migró?

### Endpoints migrados desde tweet-service → user-service:

#### **Funcionalidad de Seguimiento:**
- `POST /users/:user_id/follow` - Seguir a un usuario
- `DELETE /users/:user_id/follow` - Dejar de seguir a un usuario  
- `GET /users/:user_id/is-following` - Verificar si ya sigo a un usuario
- `GET /users/:user_id/followers-count` - Contador de seguidores
- `GET /users/:user_id/following-count` - Contador de usuarios seguidos

#### **Funcionalidad de Tweets de Usuario:**
- `GET /users/:user_id/liked-tweets` - Tweets que le han gustado a un usuario
- `GET /users/:user_id/tweets` - Tweets de un usuario específico

## 🏗️ Arquitectura Actualizada

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │
│   Port: 5173    │◄──►│   Port: 3000    │
└─────────────────┘    └─────────┬───────┘
                                 │
               ┌─────────────────┼─────────────────────────────┐
               │                 │                             │
               ▼                 ▼                             ▼
    ┌─────────────────┐ ┌─────────────────┐        ┌─────────────────┐
    │  Auth Service   │ │  Tweet Service  │        │  User Service   │
    │  Port: 3002     │ │  Port: 3003     │        │  Port: 3005     │ ✨ NUEVO
    └─────────────────┘ └─────────────────┘        └─────────────────┘
               │                 │                             │
               │                 ▼                             │
               │        ┌─────────────────┐                    │
               │        │  Feed Service   │                    │
               │        │  Port: 3005     │                    │
               │        └─────────────────┘                    │
               │                 │                             │
               │                 ▼                             │
               │        ┌─────────────────┐                    │
               │        │ Search Service  │                    │
               │        │  Port: 3004     │                    │
               │        └─────────────────┘                    │
               │                                               │
               └─────────────────┬─────────────────────────────┘
                                 ▼
                        ┌─────────────────┐
                        │    Supabase     │
                        │   Database      │
                        └─────────────────┘
```

## 🔄 Cambios en el API Gateway

El routing fue actualizado para dirigir las peticiones `/users/*` al nuevo `user-service`:

```javascript
// ANTES: Tweet-service manejaba usuarios
app.use('/users', createProxyMiddleware({
  target: 'http://localhost:3003', // ❌ tweet-service
  // ...
}));

// DESPUÉS: User-service maneja usuarios
app.use('/users', createProxyMiddleware({
  target: 'http://localhost:3005', // ✅ user-service
  // ...
}));
```

## 📁 Estructura del User-Service

```
user-service/
├── src/
│   ├── index.js                 # Servidor principal
│   ├── controllers/
│   │   └── user.controller.js   # Lógica de usuarios + seguimiento
│   ├── routes/
│   │   └── user.routes.js       # Definición de rutas
│   └── middlewares/
│       └── authMiddleware.js    # Middleware de autenticación
├── package.json
├── .env                         # Variables de entorno
└── Dockerfile                   # Configuración Docker
```

## 🚀 Puertos de Servicios

| Servicio        | Puerto | Propósito                          |
|----------------|--------|------------------------------------|
| Frontend       | 5173   | Interfaz React                     |
| API Gateway    | 3000   | Punto de entrada único             |
| Auth Service   | 3002   | Autenticación y autorización       |
| Tweet Service  | 3003   | Gestión de tweets y respuestas     |
| Search Service | 3004   | Búsqueda de tweets                 |
| **User Service** | **3005** | **Gestión de usuarios y seguimiento** ✨ |
| Feed Service   | 3006   | Timeline y feed personalizado      |

## 💾 Dependencias del User-Service

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.57.4",
    "bcrypt": "^5.1.1", 
    "cors": "^2.8.5",
    "dotenv": "^16.6.1",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2"
  }
}
```

## 🔧 Cómo ejecutar

### Opción 1: Con Docker Compose (Recomendado)
```bash
docker-compose up --build
```

### Opción 2: Desarrollo local
```bash
# Terminal 1: API Gateway
cd api-gateway && npm start

# Terminal 2: Auth Service  
cd auth-service && npm start

# Terminal 3: Tweet Service
cd tweet-service && npm start

# Terminal 4: User Service ✨
cd user-service && pnpm dev

# Terminal 5: Feed Service
cd feed-service && npm start

# Terminal 6: Search Service  
cd search-service && ./mvnw spring-boot:run

# Terminal 7: Frontend
cd frontend && npm run dev
```

## 🧪 Endpoints de User-Service

### Gestión básica de usuarios:
- `GET /users/` - Listar usuarios (requiere auth)
- `GET /users/:id` - Obtener usuario por ID (requiere auth)
- `PUT /users/:id` - Actualizar usuario (requiere auth)
- `DELETE /users/:id` - Eliminar usuario (requiere auth)

### Funcionalidad de seguimiento:
- `POST /users/:user_id/follow` - Seguir usuario
- `DELETE /users/:user_id/follow` - Dejar de seguir
- `GET /users/:user_id/is-following` - ¿Ya lo sigo?
- `GET /users/:user_id/followers-count` - Contar seguidores
- `GET /users/:user_id/following-count` - Contar seguidos

### Tweets relacionados con el usuario:
- `GET /users/:user_id/liked-tweets` - Tweets que le gustaron
- `GET /users/:user_id/tweets` - Tweets del usuario

## ✅ Beneficios de la Migración

1. **Separación de Responsabilidades**: Cada servicio tiene una responsabilidad clara
2. **Escalabilidad**: El user-service puede escalarse independientemente
3. **Mantenibilidad**: Código más organizado y fácil de mantener
4. **Microservicios Puros**: Arquitectura más limpia y profesional
5. **Flexibilidad**: Cada servicio puede usar diferentes tecnologías si es necesario

## 🔄 Compatibilidad

- ✅ Todas las rutas anteriores siguen funcionando
- ✅ El frontend no requiere cambios
- ✅ Las bases de datos siguen siendo las mismas
- ✅ Docker Compose actualizado automáticamente

La migración es **transparente** para los usuarios finales - todo sigue funcionando igual, pero ahora con una arquitectura más robusta y escalable.

## 🎯 Threading System

El sistema de hilos (threading) implementado permanece intacto y completamente funcional:

- **ThreadTweet.jsx**: Componente especializado para mostrar tweets en contexto de hilo
- **TweetDetail.jsx**: Página principal con reconstrucción completa de hilos  
- **Conectores visuales**: Líneas que conectan tweets padre-hijo
- **Navegación**: Click en tweets para ver hilo completo
- **Sistema de respuestas**: Integrado con TweetForm

Ver [THREADING_IMPLEMENTATION.md](./THREADING_IMPLEMENTATION.md) para documentación detallada del sistema de hilos.