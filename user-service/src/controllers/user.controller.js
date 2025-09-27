import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde src/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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

// SEGUIR A UN USUARIO
export const followUser = async (req, res) => {
  const { user_id } = req.params; // a quién quiero seguir
  const { follower_id } = req.body; // yo
  if (!user_id || !follower_id) return res.status(400).json({ error: 'user_id y follower_id requeridos' });
  const { error } = await supabase
    .from('follows')
    .insert([{ follower_id, following_id: user_id }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
};

// DEJAR DE SEGUIR A UN USUARIO
export const unfollowUser = async (req, res) => {
  const { user_id } = req.params;
  const { follower_id } = req.body;
  if (!user_id || !follower_id) return res.status(400).json({ error: 'user_id y follower_id requeridos' });
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', follower_id)
    .eq('following_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
};

// ¿YA LO SIGO?
export const isFollowing = async (req, res) => {
  const { user_id } = req.params;
  const { follower_id } = req.query;
  if (!user_id || !follower_id) return res.status(400).json({ error: 'user_id y follower_id requeridos' });
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', follower_id)
      .eq('following_id', user_id)
      .maybeSingle();
    if (error) {
      // Instead of 500, always return { following: false }
      return res.json({ following: false });
    }
    res.json({ following: !!data });
  } catch (e) {
    // On any unexpected error, return { following: false }
    res.json({ following: false });
  }
};

// CONTADOR DE SEGUIDORES
export const getFollowersCount = async (req, res) => {
  const { user_id } = req.params;
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ followers: count });
};

// CONTADOR DE SEGUIDOS
export const getFollowingCount = async (req, res) => {
  const { user_id } = req.params;
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ following: count });
};

// Obtener los tweets que le han gustado a un usuario
export const getUserLikedTweets = async (req, res) => {
  const { user_id } = req.params;
  // Busca los tweet_id que le han gustado al usuario
  const { data: likes, error: likesError } = await supabase
    .from('tweet_likes')
    .select('tweet_id')
    .eq('user_id', user_id);
  if (likesError) return res.status(500).json({ error: likesError.message });
  if (!likes || likes.length === 0) return res.json([]);
  const tweetIds = likes.map(l => l.tweet_id);
  // Busca los tweets con esos ids
  const { data: tweets, error: tweetsError } = await supabase
    .from('tweets')
    .select('id, content, created_at, reply_to, user_id, profiles:profiles!user_id(username)')
    .in('id', tweetIds);
  if (tweetsError) return res.status(500).json({ error: tweetsError.message });
  const result = tweets.map(tweet => ({
    ...tweet,
    username: tweet.profiles?.username || 'usuario'
  }));
  res.json(result);
};

// Obtener tweets de un usuario
export const getUserTweets = async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from('tweets')
    .select('id, content, created_at')
    .eq('user_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};