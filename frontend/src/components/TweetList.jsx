
import React, { useEffect, useState } from "react";
import Tweet from "./Tweet";
import { fetchTweetsOptimized } from "../utils/apiOptimized";
import LoadingSpinner from "./LoadingSpinner";


function TweetList({ user_id, navigate, tweets: propTweets }) {
  const [tweets, setTweets] = useState(propTweets || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si se pasan tweets por prop, no hacer fetch
    if (Array.isArray(propTweets)) {
      setTweets(propTweets);
      setLoading(false);
      return;
    }
    setLoading(true);
    
    fetchTweetsOptimized(user_id)
      .then(data => {
        if (Array.isArray(data)) {
          setTweets(data);
        } else {
          setTweets([]);
          console.error('Error: Los datos recibidos no son un array válido');
        }
        setLoading(false);
      })
      .catch(err => {
        setTweets([]);
        setLoading(false);
        console.error('Error al cargar tweets optimizado:', err.message);
      });
  }, [user_id, propTweets]);

  if (loading) {
    return <LoadingSpinner text="Cargando tweets..." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {tweets.map((tweet, idx) => (
        <Tweet key={tweet.id || idx} tweet={tweet} user_id={user_id} navigate={navigate} />
      ))}
    </div>
  );
}

export default TweetList;
