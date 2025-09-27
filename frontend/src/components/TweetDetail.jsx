import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Tweet from "./Tweet";
import ThreadTweet from "./ThreadTweet";
import UserSearch from "./UserSearch";

function TweetDetail({ tweetId, user, navigate, onLogout, handleSearchTweets }) {
  const [threadTweets, setThreadTweets] = useState([]); // Hilo completo
  const [directReplies, setDirectReplies] = useState([]); // Solo respuestas directas al tweet actual
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tweetId) return;
    
    loadThreadData(tweetId);
  }, [tweetId]);

  const loadThreadData = async (targetTweetId) => {
    setLoading(true);
    try {
      // 1. Obtener el tweet actual
      const tweetRes = await fetch(`http://localhost:3000/tweets/${targetTweetId}`);
      const currentTweet = await tweetRes.json();
      
      // 2. Construir el hilo completo hacia atrás (hasta la raíz)
      let thread = [currentTweet];
      let parentId = currentTweet.reply_to;
      
      // Seguir la cadena de reply_to hasta llegar a la raíz
      while (parentId) {
        try {
          const parentRes = await fetch(`http://localhost:3000/tweets/${parentId}`);
          const parentTweet = await parentRes.json();
          thread.unshift(parentTweet); // Agregar al principio
          parentId = parentTweet.reply_to;
        } catch (error) {
          break; // Si no se puede obtener el padre, terminar
        }
      }
      
      setThreadTweets(thread);
      
      // 3. Obtener respuestas directas al tweet actual
      const repliesRes = await fetch(`http://localhost:3000/tweets/${targetTweetId}/replies`);
      const replies = await repliesRes.json();
      setDirectReplies(replies);
      
    } catch (error) {
      console.error('Error loading thread:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar onLogout={onLogout} active="home" navigate={navigate} />
        <main className="flex-1 ml-64 max-w-2xl border-x border-gray-800 min-h-screen">
          <div className="p-8 text-gray-400">Cargando hilo...</div>
        </main>
        <aside className="w-80 p-4 space-y-4 hidden lg:block">
          <div className="sticky top-4">
            <UserSearch
              onSelect={user => {
                navigate(`/profile/${user.user_id}`);
              }}
              onSearchTweets={handleSearchTweets}
            />
          </div>
        </aside>
      </div>
    );
  }

  if (threadTweets.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar onLogout={onLogout} active="home" navigate={navigate} />
        <main className="flex-1 ml-64 max-w-2xl border-x border-gray-800 min-h-screen">
          <div className="p-8 text-red-400">Tweet no encontrado</div>
        </main>
        <aside className="w-80 p-4 space-y-4 hidden lg:block">
          <div className="sticky top-4">
            <UserSearch
              onSelect={user => {
                navigate(`/profile/${user.user_id}`);
              }}
              onSearchTweets={handleSearchTweets}
            />
          </div>
        </aside>
      </div>
    );
  }

  const currentTweet = threadTweets[threadTweets.length - 1]; // El último es el tweet actual

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar onLogout={onLogout} active="home" navigate={navigate} />
      <main className="flex-1 ml-64 max-w-2xl border-x border-gray-800 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-black bg-opacity-80 backdrop-blur border-b border-gray-800 p-4 z-10 flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
          <h2 className="text-xl font-bold">Hilo</h2>
        </div>

        {/* Hilo completo */}
        <div className="bg-black p-4 space-y-4">
          {threadTweets.map((threadTweet, index) => {
            const isCurrentTweet = threadTweet.id === tweetId;
            const isLastInThread = index === threadTweets.length - 1;
            
            return (
              <ThreadTweet 
                key={threadTweet.id}
                tweet={threadTweet} 
                user_id={user?.user_id} 
                navigate={navigate}
                isCurrentTweet={isCurrentTweet}
                isLastInThread={isLastInThread}
                showConnector={threadTweets.length > 1}
              />
            );
          })}
        </div>

        {/* Respuestas directas al tweet actual */}
        <div className="bg-black">
          <div className="px-4 py-3 text-gray-400 font-medium border-b border-gray-800">
            Respuestas ({directReplies.length})
          </div>
          {directReplies.length === 0 ? (
            <div className="p-4 text-gray-400">No hay respuestas aún</div>
          ) : (
            directReplies.map((reply, index) => (
              <ThreadTweet 
                key={reply.id}
                tweet={reply} 
                user_id={user?.user_id} 
                navigate={navigate}
                isCurrentTweet={false}
                isLastInThread={index === directReplies.length - 1}
                showConnector={false}
                isReply={true}
                replyCount={reply.reply_count}
              />
            ))
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 p-4 space-y-4 hidden lg:block">
        <div className="sticky top-4">
          <UserSearch
            onSelect={user => {
              navigate(`/profile/${user.user_id}`);
            }}
            onSearchTweets={handleSearchTweets}
          />
        </div>
      </aside>
    </div>
  );
}

export default TweetDetail;