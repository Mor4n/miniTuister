# 🧪 Guía de Pruebas - Edición de Perfil

## 🚀 Cómo Probar la Funcionalidad

### 1. **Preparar el Entorno**
```bash
# Instalar dependencias del user-service
cd user-service
pnpm install

# Verificar que tienes las variables de entorno
cat src/.env
```

### 2. **Ejecutar los Servicios**
```bash
# Desde el directorio raíz del proyecto
npm run start:all

# O manualmente:
# Terminal 1: API Gateway
cd api-gateway && npm start

# Terminal 2: Auth Service  
cd auth-service && npm start

# Terminal 3: Tweet Service
cd tweet-service && npm start

# Terminal 4: User Service (NUEVO)
cd user-service && pnpm dev

# Terminal 5: Feed Service
cd feed-service && npm start

# Terminal 6: Frontend
cd frontend && npm run dev
```

### 3. **Probar la Funcionalidad**

#### **Paso 1: Verificar que user-service esté corriendo**
- Abrir: http://localhost:3005 (debería mostrar un error 404, pero no de conexión)
- Verificar en consola: "User service running on port 3005"

#### **Paso 2: Probar desde el Frontend**
1. **Ir a tu perfil**:
   - Login en la aplicación
   - Click en tu perfil
   - Verificar que aparece el botón "Editar perfil" (solo en tu propio perfil)

2. **Abrir modal de edición**:
   - Click en "Editar perfil"
   - Debería abrir un modal con tema oscuro/Twitter
   - Verificar que carga los datos actuales del perfil

3. **Probar subida de imagen**:
   - Click en la imagen de perfil
   - Seleccionar una imagen (JPEG, PNG, GIF, WebP)
   - Verificar preview inmediato
   - La imagen se debe guardar en: `user-service/uploads/profile-images/`

4. **Probar cambio de datos**:
   - Cambiar nombre completo
   - Cambiar biografía (máximo 160 caracteres)
   - Click "Guardar cambios"
   - Verificar mensaje de éxito

5. **Probar cambio de contraseña**:
   - Click "Cambiar contraseña"
   - Ingresar contraseña actual
   - Ingresar nueva contraseña (mínimo 6 caracteres)
   - Confirmar nueva contraseña
   - Click "Cambiar contraseña"

### 4. **Verificar Endpoints Manualmente**

#### **GET Profile (público)**
```bash
curl -X GET http://localhost:3000/users/[USER_ID]/profile
```

#### **PUT Profile (requiere autenticación)**
```bash
curl -X PUT http://localhost:3000/users/[USER_ID]/profile \
  -H "Authorization: Bearer [TOKEN]" \
  -F "full_name=Mi Nuevo Nombre" \
  -F "bio=Mi nueva biografía" \
  -F "avatar=@imagen.jpg"
```

#### **PUT Change Password**
```bash
curl -X PUT http://localhost:3000/users/[USER_ID]/change-password \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "contraseña_actual",
    "newPassword": "nueva_contraseña"
  }'
```

### 5. **Verificar Archivos Creados**

#### **Estructura esperada:**
```
user-service/
├── uploads/
│   └── profile-images/
│       └── profile_[USER_ID]_[TIMESTAMP].jpg
├── src/
│   ├── .env (con JWT_SECRET)
│   ├── middlewares/
│   │   └── upload.js ✅
│   ├── controllers/
│   │   └── user.controller.js ✅ (nuevas funciones)
│   └── routes/
│       └── user.routes.js ✅ (nuevas rutas)

frontend/src/components/
├── EditProfile.jsx ✅ (con Tailwind)
└── Profile.jsx ✅ (botón editar)
```

### 6. **Debugging - Errores Comunes**

#### **Error: "Cannot read properties of null (reading 'length')"**
✅ **SOLUCIONADO**: Agregamos validación segura `?.length || 0`

#### **Error: "supabaseUrl is required"**
✅ **SOLUCIONADO**: Variables de entorno configuradas correctamente

#### **Error: "Token inválido"**
- Verificar que JWT_SECRET sea el mismo en auth-service y user-service
- Verificar que el token se envía en headers: `Authorization: Bearer [token]`

#### **Error: "Multer error"**
- Verificar que la carpeta `uploads/profile-images/` existe
- Verificar permisos de escritura
- Verificar que el archivo es una imagen válida

#### **Error: "Port 3005 already in use"**
- Matar proceso: `taskkill /f /im node.exe`
- O cambiar puerto en user-service/.env

### 7. **URLs de Prueba**

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **User Service**: http://localhost:3005
- **Imágenes**: http://localhost:3000/uploads/profile-images/[filename]

### 8. **Base de Datos (Supabase)**

Verificar que la tabla `profiles` tenga estas columnas:
```sql
-- Ejecutar en Supabase SQL Editor si no existen
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS avatar_url text;
```

### 9. **Monitoreo en Tiempo Real**

**Consola del Browser (F12)**:
- Verificar requests a `/users/[id]/profile`
- Verificar que no hay errores 404 o 500
- Verificar que las imágenes cargan correctamente

**Consola del Servidor**:
- User-service debería mostrar: "User service running on port 3005"
- API Gateway debería mostrar proxying requests
- No debería haber errores de autenticación

---

## ✅ **Checklist de Funcionamiento**

- [ ] User-service arranca en puerto 3005
- [ ] Modal de edición abre sin errores
- [ ] Preview de imagen funciona
- [ ] Subida de imagen guarda archivo en uploads/
- [ ] Actualización de perfil funciona
- [ ] Cambio de contraseña funciona
- [ ] URLs de imágenes son accesibles
- [ ] Tema oscuro se ve como Twitter
- [ ] Validaciones funcionan (tamaño, tipo de archivo)
- [ ] Estados de carga se muestran correctamente

**¡Si todos los elementos del checklist funcionan, la implementación está completa!** 🎉