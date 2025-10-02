
const express = require('express');
const supabase = require('./index');
const app = express();
app.use(express.json());

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('[TWEET-SERVICE] Error:', err);
  res.status(500).json({ error: 'Error interno del microservicio de tweets' });
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
    .eq('reply_to', tweet_id)
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  
  // Agregar conteo de respuestas para cada tweet
  const repliesWithCount = await Promise.all(data.map(async (reply) => {
    const { count } = await supabase
      .from('tweets')
      .select('*', { count: 'exact', head: true })
      .eq('reply_to', reply.id);
    
    return {
      ...reply,
      username: reply.profiles?.username || 'usuario',
      reply_count: count || 0
    };
  }));
  
  res.json(repliesWithCount);
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
// Obtener un tweet específico por ID
app.get('/tweets/:tweet_id', async (req, res) => {
  const { tweet_id } = req.params;
  
  const { data, error } = await supabase
    .from('tweets')
    .select(`
      id, content, created_at, reply_to, user_id,
      profiles:profiles!user_id(username, full_name, bio, avatar_url)
    `)
    .eq('id', tweet_id)
    .single();
    
  if (error) return res.status(404).json({ error: 'Tweet no encontrado' });
  
  // Obtener likes del tweet
  const { count: likesCount } = await supabase
    .from('tweet_likes')
    .select('*', { count: 'exact', head: true })
    .eq('tweet_id', tweet_id);
    
  // Obtener conteo de respuestas
  const { count: repliesCount } = await supabase
    .from('tweets')
    .select('*', { count: 'exact', head: true })
    .eq('reply_to', tweet_id);
  
  const tweet = {
    ...data,
    username: data.profiles?.username || 'usuario',
    author_profile: {
      full_name: data.profiles?.full_name,
      bio: data.profiles?.bio,
      avatar_url: data.profiles?.avatar_url
    },
    likes_count: likesCount || 0,
    replies_count: repliesCount || 0
  };
  
  res.json(tweet);
});

app.get('/tweets', async (req, res) => {
  const { data, error } = await supabase
    .from('tweets')
    .select(`
      id, content, created_at, reply_to, user_id,
      profiles:profiles!user_id(username, full_name, bio, avatar_url)
    `)
    .order('created_at', { ascending: false });
    
  if (error) return res.status(500).json({ error: error.message });
  
  // Obtener likes para todos los tweets de una vez
  const tweetIds = data.map(tweet => tweet.id);
  const { data: likesData } = await supabase
    .from('tweet_likes')
    .select('tweet_id')
    .in('tweet_id', tweetIds);
    
  // Contar likes por tweet
  const likeCounts = {};
  likesData?.forEach(like => {
    likeCounts[like.tweet_id] = (likeCounts[like.tweet_id] || 0) + 1;
  });
  
  // Obtener conteo de respuestas para todos los tweets
  const { data: repliesData } = await supabase
    .from('tweets')
    .select('reply_to')
    .in('reply_to', tweetIds)
    .not('reply_to', 'is', null);
    
  // Contar respuestas por tweet
  const replyCounts = {};
  repliesData?.forEach(reply => {
    replyCounts[reply.reply_to] = (replyCounts[reply.reply_to] || 0) + 1;
  });
  
  const tweets = data.map(tweet => ({
    ...tweet,
    username: tweet.profiles?.username || 'usuario',
    author_profile: {
      full_name: tweet.profiles?.full_name,
      bio: tweet.profiles?.bio,
      avatar_url: tweet.profiles?.avatar_url
    },
    likes_count: likeCounts[tweet.id] || 0,
    replies_count: replyCounts[tweet.id] || 0
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

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Tweet service running on port ${PORT}`));
