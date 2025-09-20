
import React, { useEffect, useState } from "react";
import Tweet from "./Tweet";

function TweetList({ user_id, navigate }) {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/tweets?user_id=${user_id}`)
      .then(async res => {
        let data;
        try {
          data = await res.json();
        } catch (jsonErr) {
          setTweets([]);
          setLoading(false);
          console.error('Error al cargar tweets: No se pudo procesar la respuesta del servidor.');
          return;
        }
        if (res.ok && Array.isArray(data)) {
          setTweets(data);
        } else {
          setTweets([]);
          console.error('Error al cargar tweets:', data.error || data);
        }
        setLoading(false);
      })
      .catch(err => {
        setTweets([]);
        setLoading(false);
        console.error('Error al cargar tweets: No se pudo conectar con el servidor.');
      });
  }, [user_id]);

  if (loading) {
    return <div className="text-gray-400">Cargando tweets...</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {tweets.map((tweet, idx) => (
        <Tweet key={idx} tweet={tweet} user_id={user_id} navigate={navigate} />
      ))}
    </div>
  );
}

export default TweetList;
