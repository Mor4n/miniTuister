import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";
import { generateToken, verifyToken } from "../utils/jwt.js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) throw new Error("Usuario no encontrado");

    const valid = await bcrypt.compare(password, data.password);
    if (!valid) throw new Error("Contraseña incorrecta");

    // ✅ Usamos la utilidad
    const token = generateToken({ id: data.id, email: data.email });

    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const verify = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(403).json({ error: "Token requerido" });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: "Token inválido" });

  res.json({ valid: true, user: decoded });
};