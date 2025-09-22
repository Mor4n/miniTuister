
const express = require('express');
const supabase = require('./index');
const app = express();
app.use(express.json());

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('[FEED-SERVICE] Error:', err);
  res.status(500).json({ error: 'Error interno del microservicio de feed' });
});
// Obtener el feed personalizado para un usuario (solo seguidos)
app.get('/feed/:user_id', async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.status(400).json({ error: 'user_id requerido' });

  // 1. Obtener IDs de usuarios seguidos
  const { data: following, error: followingError } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user_id);
  if (followingError) return res.status(500).json({ error: followingError.message });

  if (!following || following.length === 0) {
    return res.json([]); // Si no sigue a nadie, devolver lista vacía
  }

  // 2. Obtener tweets de los usuarios seguidos
  const followingIds = following.map(f => f.following_id);
  const { data: feedTweets, error: feedError } = await supabase
    .from('tweets')
    .select('id, content, created_at, user_id, profiles:profiles!user_id(username)')
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .limit(30);
  if (feedError) return res.status(500).json({ error: feedError.message });

  // Transformar la respuesta para aplanar la estructura de profiles
  const transformedTweets = feedTweets.map(tweet => ({
    ...tweet,
    username: tweet.profiles?.username || 'Usuario',
    profiles: undefined // Eliminar el objeto profiles anidado
  }));

  res.json(transformedTweets);
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Feed service running on port ${PORT}`));
