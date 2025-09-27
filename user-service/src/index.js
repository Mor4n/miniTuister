
import dotenv from "dotenv";

// Configurar dotenv ANTES de importar otros módulos
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') }); // Cargar desde el mismo directorio que index.js

// Debug: verificar que las variables se cargaron
console.log('[USER-SERVICE] SUPABASE_URL:', process.env.SUPABASE_URL ? 'Loaded ✅' : 'Missing ❌');
console.log('[USER-SERVICE] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Loaded ✅' : 'Missing ❌');

import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// rutas
app.use("/users", userRoutes);
// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('[USER-SERVICE] Error:', err);
  res.status(500).json({ error: 'Error interno del microservicio de usuarios' });
});
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});