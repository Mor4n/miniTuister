// Responder a un tweet
app.post('/tweets/:tweet_id/reply', async (req, res) => {
  const { user_id, content } = req.body;
  const { tweet_id } = req.params;
  if (!user_id || !content) {
    return res.status(400).json({ error: 'user_id y content son requeridos' });
  }
  // Se asume que la tabla tweets tiene un campo reply_to (bigint, nullable)
  const { data, error } = await supabase
    .from('tweets')
    .insert([{ user_id, content, reply_to: tweet_id }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// Obtener respuestas a un tweet
app.get('/tweets/:tweet_id/replies', async (req, res) => {
  const { tweet_id } = req.params;
  const { data, error } = await supabase
    .from('tweets')
    .select('id, content, created_at, user_id')
    .eq('reply_to', tweet_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
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
const express = require('express');
const supabase = require('./index');
const app = express();
app.use(express.json());

// Obtener todos los tweets
app.get('/tweets', async (req, res) => {
  const { data, error } = await supabase
    .from('tweets')
    .select('id, content, created_at, user_id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Crear un tweet
app.post('/tweets', async (req, res) => {
  const { user_id, content } = req.body;
  if (!user_id || !content) {
    return res.status(400).json({ error: 'user_id y content son requeridos' });
  }
  const { data, error } = await supabase
    .from('tweets')
    .insert([{ user_id, content }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
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
