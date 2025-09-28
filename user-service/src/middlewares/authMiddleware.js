import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(403).json({ error: "Token requerido" });

  try {
    // Usar la misma clave que usas en auth-service
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// Middleware opcional de autenticación
export const optionalAuthMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      req.user = decoded;
    } catch (err) {
      // Si el token es inválido, continuamos sin usuario autenticado
      req.user = null;
    }
  }
  
  next();
};