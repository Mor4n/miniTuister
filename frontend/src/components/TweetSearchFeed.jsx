import React, { useEffect, useState } from "react";
import TweetList from "./TweetList";

export default function TweetSearchFeed({ query }) {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`http://localhost:3000/search/tweets?query=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setTweets(data);
        setLoading(false);
      })
      .catch(() => {
        setTweets([]);
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 bg-black bg-opacity-80 backdrop-blur border-b border-gray-800 p-4 z-10">
        <h2 className="text-xl font-bold text-blue-400">Resultados de tweets para "{query}"</h2>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="text-gray-400">Buscando tweets...</div>
        ) : tweets.length > 0 ? (
          <TweetList tweets={tweets} />
        ) : (
          <div className="text-gray-400">No se encontraron tweets.</div>
        )}
      </div>
    </div>
  );
}
