const express = require('express');
const supabase = require('./index');
const app = express();
app.use(express.json());


// SEGUIR A UN USUARIO
app.post('/users/:user_id/follow', async (req, res) => {
  const { user_id } = req.params; // a quién quiero seguir
  const { follower_id } = req.body; // yo
  if (!user_id || !follower_id) return res.status(400).json({ error: 'user_id y follower_id requeridos' });
  const { error } = await supabase
    .from('follows')
    .insert([{ follower_id, following_id: user_id }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// DEJAR DE SEGUIR A UN USUARIO
app.delete('/users/:user_id/follow', async (req, res) => {
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
});

// ¿YA LO SIGO?
app.get('/users/:user_id/is-following', async (req, res) => {
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
});

// CONTADOR DE SEGUIDORES
app.get('/users/:user_id/followers-count', async (req, res) => {
  const { user_id } = req.params;
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ followers: count });
});

// CONTADOR DE SEGUIDOS
app.get('/users/:user_id/following-count', async (req, res) => {
  const { user_id } = req.params;
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ following: count });
});


// Obtener los tweets que le han gustado a un usuario
app.get('/users/:user_id/liked-tweets', async (req, res) => {
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
});

// Quitar like de un tweet
app.delete('/tweets/:tweet_id/like', async (req, res) => {
  const { tweet_id } = req.params;
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id es requerido' });
  }
  const { error } = await supabase
    .from('tweet_likes')
    .delete()
    .eq('tweet_id', tweet_id)
    .eq('user_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});


// Responder a un tweet
app.post('/tweets/:tweet_id/reply', async (req, res) => {
  const { user_id, username, content } = req.body;
  const { tweet_id } = req.params;
  if (!user_id || !content) {
    return res.status(400).json({ error: 'user_id y content son requeridos' });
  }
  // Se asume que la tabla tweets tiene un campo reply_to (bigint, nullable) y username (text, nullable)
  const { data, error } = await supabase
    .from('tweets')
    .insert([{ user_id, username, content, reply_to: tweet_id }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// Obtener respuestas a un tweet
app.get('/tweets/:tweet_id/replies', async (req, res) => {
  const { tweet_id } = req.params;
  const { data, error } = await supabase
    .from('tweets')
    .select('id, content, created_at, user_id, profiles:profiles!user_id(username)')
    .eq('reply_to', tweet_id);
  if (error) return res.status(500).json({ error: error.message });
  const replies = data.map(reply => ({
    ...reply,
    username: reply.profiles?.username || 'usuario'
  }));
  res.json(replies);
});

// Borrar un tweet
app.delete('/tweets/:tweet_id', async (req, res) => {
  const { tweet_id } = req.params;
  const { data, error } = await supabase
    .from('tweets')
    .delete()
    .eq('id', tweet_id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ deleted: data.length });
});

// Obtener todos los tweets
app.get('/tweets', async (req, res) => {
  const { data, error } = await supabase
    .from('tweets')
    .select('id, content, created_at, reply_to, user_id, profiles:profiles!user_id(username)')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const tweets = data.map(tweet => ({
    ...tweet,
    username: tweet.profiles?.username || 'usuario'
  }));
  res.json(tweets);
});

// Crear un tweet
app.post('/tweets', async (req, res) => {
  console.log('POST /tweets', req.body); // Log para depuración
  const { user_id, content } = req.body;
  if (!user_id || !content) {
    return res.status(400).json({ error: 'user_id y content son requeridos' });
  }
  if (content.length > 280) {
    return res.status(400).json({ error: 'El contenido debe ser menor a 280 caracteres' });
  }
  try {
    const { data, error } = await supabase
      .from('tweets')
      .insert([{ user_id, content }])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating tweet:', error);
    res.status(500).json({ error: error.message || 'Error creating tweet' });
  }
});

app.put('/tweets/:tweet_id', async (req, res) => {
  const { content } = req.body;
  const { tweet_id } = req.params;
  if (!content || content.length > 280) {
    return res.status(400).json({ error: 'El contenido es requerido y debe ser menor a 280 caracteres' });
  }
  const { data, error } = await supabase
    .from('tweets')
    .update({ content })
    .eq('id', tweet_id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.post('/tweets/:tweet_id/retweet', async (req, res) => {
  const { user_id } = req.body;
  const { tweet_id } = req.params;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id es requerido' });
  }
  // Crea un nuevo tweet con retweet_to apuntando al tweet original
  const { data, error } = await supabase
    .from('tweets')
    .insert([{ user_id, content: '', retweet_to: tweet_id }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// Obtener tweets de un usuario
app.get('/users/:user_id/tweets', async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from('tweets')
    .select('id, content, created_at')
    .eq('user_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Like a tweet
app.post('/tweets/:tweet_id/like', async (req, res) => {
  const { user_id } = req.body;
  const { tweet_id } = req.params;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id es requerido' });
  }
  const { data, error } = await supabase
    .from('tweet_likes')
    .insert([{ user_id, tweet_id }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// Obtener likes de un tweet
app.get('/tweets/:tweet_id/likes', async (req, res) => {
  const { tweet_id } = req.params;
  const { user_id } = req.query;
  // Contar likes
  const { count, error } = await supabase
    .from('tweet_likes')
    .select('*', { count: 'exact', head: true })
    .eq('tweet_id', tweet_id);
  if (error) return res.status(500).json({ error: error.message });

  // Si se pasa user_id, verificar si ya dio like
  let liked = false;
  if (user_id) {
    const { data: likeData, error: likeError } = await supabase
      .from('tweet_likes')
      .select('user_id')
      .eq('tweet_id', tweet_id)
      .eq('user_id', user_id)
      .maybeSingle();
    if (likeError) return res.status(500).json({ error: likeError.message });
    liked = !!likeData;
  }
  res.json({ likes: count, liked });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Tweet service running on port ${PORT}`));
