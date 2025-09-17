import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "supersecreto"; // ⚠️ cámbialo en producción

// generar token
export const generateToken = (payload, expiresIn = "1h") => {
  return jwt.sign(payload, secret, { expiresIn });
};

// verificar token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null; // si falla, devolvemos null
  }
};

// Middleware de autenticación para endpoints protegidos
export const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(403).json({ error: "Token requerido" });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: "Token inválido" });

  req.user = decoded;
  next();
};
