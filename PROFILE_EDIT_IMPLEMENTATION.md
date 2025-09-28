# 📝 Funcionalidad de Edición de Perfil - MiniTuister

## 🎯 Funcionalidades Implementadas

### ✅ **Edición de Perfil Completa**
- **Nombre completo**: Actualización del nombre real del usuario (no el @username)
- **Biografía**: Campo de texto para descripción personal (máximo 160 caracteres)
- **Foto de perfil**: Subida de imagen con preview y almacenamiento local
- **Cambio de contraseña**: Con validación de contraseña actual

### 🔐 **Seguridad**
- ✅ Autenticación requerida para editar perfil
- ✅ Validación de contraseña actual antes del cambio
- ✅ Hashing de contraseñas con bcrypt
- ✅ Validación de tipos de archivo (solo imágenes)
- ✅ Límite de tamaño de archivo (5MB máximo)

## 🏗️ Arquitectura

### **Backend (User-Service - Puerto 3005)**

#### **Nuevos Endpoints:**
```javascript
// Obtener perfil público
GET /users/:id/profile

// Actualizar perfil (requiere autenticación)
PUT /users/:id/profile
Content-Type: multipart/form-data
Body: { full_name, bio, avatar (file) }

// Cambiar contraseña (requiere autenticación)  
PUT /users/:id/change-password
Body: { currentPassword, newPassword }

// Servir imágenes estáticas
GET /uploads/profile-images/:filename
```

#### **Middleware de Subida de Archivos:**
```javascript
// src/middlewares/upload.js
- Almacenamiento: ./uploads/profile-images/
- Formato de nombre: profile_{userId}_{timestamp}.ext
- Validación: Solo imágenes, máximo 5MB
```

### **Frontend (React)**

#### **Componente EditProfile.jsx:**
```jsx
<EditProfile 
  userId={currentUser.user_id}
  onClose={() => setShowEditProfile(false)}
  onProfileUpdated={(profile) => updateProfileData(profile)}
/>
```

#### **Características del UI:**
- ✅ Modal overlay responsive
- ✅ Preview de imagen antes de subir
- ✅ Validación en tiempo real
- ✅ Estados de carga y error
- ✅ Sección separada para cambio de contraseña
- ✅ Contador de caracteres para biografía

## 📁 Estructura de Archivos

```
user-service/
├── uploads/
│   └── profile-images/          # 📁 Imágenes de perfil
├── src/
│   ├── middlewares/
│   │   └── upload.js            # 🔧 Configuración Multer
│   ├── controllers/
│   │   └── user.controller.js   # ➕ Nuevas funciones
│   └── routes/
│       └── user.routes.js       # ➕ Nuevas rutas

frontend/src/components/
├── EditProfile.jsx              # 🆕 Modal de edición
├── EditProfile.css              # 🎨 Estilos del modal
└── Profile.jsx                  # ✏️ Botón "Editar perfil"

api-gateway/
└── app.js                       # ➕ Proxy para /uploads
```

## 🚀 Cómo Usar

### **Para el Usuario:**

1. **Ir a tu perfil** → Aparece botón "Editar perfil" (solo en tu propio perfil)
2. **Click en "Editar perfil"** → Se abre modal
3. **Actualizar información:**
   - Cambiar foto: Click en "Cambiar foto de perfil"
   - Editar nombre y biografía
   - Click "Guardar Cambios"
4. **Cambiar contraseña (opcional):**
   - Click "Cambiar Contraseña"
   - Ingresar contraseña actual
   - Ingresar nueva contraseña (2 veces)
   - Click "Cambiar Contraseña"

### **Para Desarrollo:**

```bash
# 1. Instalar dependencias del user-service
cd user-service
pnpm install

# 2. Ejecutar todos los servicios
npm run start:all

# 3. Las imágenes se guardan en:
user-service/uploads/profile-images/

# 4. URLs de imágenes:
http://localhost:3000/uploads/profile-images/profile_123_1234567890.jpg
```

## 🔧 Configuraciones Importantes

### **Base de Datos (Supabase)**
La tabla `profiles` debe tener estas columnas:
```sql
profiles (
  id uuid PRIMARY KEY,
  username text UNIQUE,
  full_name text,           -- ➕ NUEVO
  bio text,                 -- ➕ NUEVO  
  avatar_url text,          -- ➕ NUEVO
  password_hash text,       -- Para cambio de contraseña
  created_at timestamp
)
```

### **Variables de Entorno**
```env
# user-service/.env o user-service/src/.env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3005
```

### **API Gateway**
```javascript
// Proxy para user-service
'/users' → 'http://localhost:3005'

// Proxy para imágenes  
'/uploads' → 'http://localhost:3005/uploads'
```

## 🎨 Estilos y UX

- **Responsive**: Funciona en móvil y desktop
- **Tema consistente**: Sigue el diseño de Twitter/X
- **Estados visuales**: Loading, error, success
- **Validación en tiempo real**: Contadores de caracteres, tipos de archivo
- **Experiencia fluida**: Modal se cierra automáticamente después de guardar

## 🐛 Manejo de Errores

### **Backend:**
- ✅ Validación de tipos de archivo
- ✅ Límites de tamaño
- ✅ Verificación de contraseña actual
- ✅ Validación de longitud de contraseña nueva

### **Frontend:**
- ✅ Mensajes de error claros
- ✅ Estados de carga
- ✅ Validación de formularios
- ✅ Confirmación de contraseñas

## 📊 Estados del Modal

1. **Cargando perfil**: Spinner mientras obtiene datos actuales
2. **Modo edición**: Formularios activos con datos actuales
3. **Subiendo cambios**: Botones deshabilitados con "Guardando..."
4. **Éxito**: Mensaje verde y cierre automático
5. **Error**: Mensaje rojo con detalles del problema

---

**✨ La funcionalidad está lista para usar!** Solo necesitas actualizar tu tabla `profiles` en Supabase con las nuevas columnas si no las tienes ya.