const express = require('express');
const supabase = require('./index');
const app = express();
app.use(express.json());

// Obtener el feed personalizado para un usuario
app.get('/feed/:user_id', async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.status(400).json({ error: 'user_id requerido' });

  // 1. Obtener IDs de usuarios seguidos
  const { data: following, error: followingError } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user_id);
  if (followingError) return res.status(500).json({ error: followingError.message });

  // 2. Construir lista de IDs: yo + seguidos
  const followingIds = following ? following.map(f => f.following_id) : [];
  followingIds.push(user_id); // incluir mis propios tuits

  // 3. Obtener tuits de yo + seguidos
  let { data: feedTweets, error: feedError } = await supabase
    .from('tweets')
    .select('id, content, created_at, user_id, profiles:profiles!user_id(username)')
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .limit(30);
  if (feedError) return res.status(500).json({ error: feedError.message });

  // 4. Obtener algunos tuits aleatorios de otros usuarios (que no sigo)
  const { data: randomTweets, error: randomError } = await supabase
    .from('tweets')
    .select('id, content, created_at, user_id, profiles:profiles!user_id(username)')
    .not('user_id', 'in', `(${followingIds.map(id => `'${id}'`).join(',')})`)
    .order('created_at', { ascending: false })
    .limit(5);
  if (randomError) return res.status(500).json({ error: randomError.message });

  // 5. Mezclar y devolver el feed
  const allTweets = [...feedTweets, ...randomTweets];
  // Opcional: mezclar aleatoriamente
  allTweets.sort(() => Math.random() - 0.5);

  res.json(allTweets);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Feed service running on port ${PORT}`));
