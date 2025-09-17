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
