
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

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
const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});