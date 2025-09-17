import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { generateToken } from "../utils/jwt.js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Verifica si el usuario ya existe
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (existing) throw new Error("El usuario ya existe");

    const hashed = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from("users")
      .insert([{ username, password: hashed }])
      .select();
    if (error) throw new Error(error.message);

    // Crear perfil en la tabla profiles
    await supabase
      .from("profiles")
      .insert([{ id: data[0].id, username: data[0].username }]);

    res.status(201).json({ id: data[0].id, username: data[0].username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};