import React, { useState, useEffect } from "react";
import TweetForm from "./components/TweetForm";
import TweetList from "./components/TweetList";

function App() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Log temporal para depuración de reply_to
  useEffect(() => {
    tweets.forEach(t => console.log('tweet id:', t.id, 'reply_to:', t.reply_to));
  }, [tweets]);

  // Función para cargar tweets desde el backend
  const fetchTweets = () => {
    setLoading(true);
    fetch("http://localhost:3000/tweets")
      .then((res) => res.json())
      .then((data) => {
        setTweets(data.reverse());
        setLoading(false);
      });
  };

  // Cargar tweets al iniciar
  useEffect(() => {
    fetchTweets();
  }, []);

  // Crear tweet usando el microservicio
  const addTweet = async (tweet) => {
    const user_id = "6f28949f-5ba7-4258-9706-d5aa7f083804";
    await fetch("http://localhost:3000/tweets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, content: tweet.text }),
    });
    fetchTweets();
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 fixed h-full border-r border-gray-800 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-400">miniTuister</h1>
        </div>
        <nav className="space-y-2 flex-1">
          <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 cursor-pointer transition-colors text-blue-400">
            <span className="text-xl font-medium">Inicio</span>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 cursor-pointer transition-colors">
            <span className="text-xl font-medium">Explorar</span>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 cursor-pointer transition-colors">
            <span className="text-xl font-medium">Perfil</span>
          </div>
        </nav>
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full mt-8 transition-colors">
          Postear
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 max-w-2xl border-x border-gray-800 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-black bg-opacity-80 backdrop-blur border-b border-gray-800 p-4 z-10">
          <h2 className="text-xl font-bold">Inicio</h2>
        </div>
        {/* Tweet Composer */}
        <div className="border-b border-gray-800 p-4">
          <TweetForm onTweet={addTweet} />
        </div>
        {/* Timeline */}
        <div className="p-4">
          {loading ? (
            <div className="text-gray-400">Cargando tweets...</div>
          ) : (
            <TweetList tweets={tweets.filter(tweet => tweet.reply_to === null || tweet.reply_to === undefined)} />
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 p-4 space-y-4 hidden lg:block">
        {/* Search */}
        <div className="bg-gray-900 rounded-full p-3 mb-4">
          <input
            type="text"
            placeholder="Buscar en miniTuister"
            className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 w-full"
          />
        </div>
      </aside>
    </div>
  );
}

export default App;