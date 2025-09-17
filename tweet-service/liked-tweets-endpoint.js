// Endpoint para obtener los tweets que le han gustado a un usuario
// GET /users/:user_id/liked-tweets
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
