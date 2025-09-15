import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// listar todos los usuarios
export const getUsers = async (req, res) => {
  const { data, error } = await supabase.from("users").select("id, username, email, created_at");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// obtener un usuario por id
export const getUser = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("users")
    .select("id, username, email, created_at")
    .eq("id", id)
    .single();

  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
};

// actualizar perfil de usuario
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase.from("users").update(updates).eq("id", id).select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
};

// eliminar usuario
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("users").delete().eq("id", id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Usuario eliminado correctamente" });
};