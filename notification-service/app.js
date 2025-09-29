import express from "express";
import supabase from "./index.js";

const app = express();
app.use(express.json());

// Crear notificación
app.post("/notifications", async (req, res) => {
  const { user_id, type, message } = req.body;
  if (!user_id || !type || !message) {
    return res.status(400).json({ error: "user_id, type y message son requeridos" });
  }
  const { data, error } = await supabase
    .from("notifications")
    .insert([{ user_id, type, message }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// Obtener notificaciones de un usuario
app.get("/notifications/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("[notification-service] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
// Marcar notificación como leída
app.put("/notifications/:id/read", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => console.log(`Notification service running on port ${PORT}`));
