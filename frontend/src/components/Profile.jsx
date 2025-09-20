

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TweetList from "./TweetList";

function Profile({ user, tweets, onLogout, navigate, currentUser }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  // Cargar estado de follow y contadores (contadores siempre, follow solo si no es mi perfil)
  // Cargar estado de follow y contadores (contadores siempre, follow solo si no es mi perfil)
  const fetchCounts = (uid) => {
    if (!uid) return;
    fetch(`http://localhost:3000/users/${uid}/followers-count`)
      .then(res => res.json())
      .then(data => setFollowers(data.followers || 0));
    fetch(`http://localhost:3000/users/${uid}/following-count`)
      .then(res => res.json())
      .then(data => setFollowing(data.following || 0));
  };
  useEffect(() => {
    if (!currentUser || !user.user_id) return;
    if (user.user_id !== currentUser.user_id) {
      fetch(`http://localhost:3000/users/${user.user_id}/is-following?follower_id=${currentUser.user_id}`)
        .then(res => res.json())
        .then(data => setIsFollowing(!!data.following));
    }
    fetchCounts(user.user_id);
    // Si es mi perfil, también actualiza mi propio contador de following
    if (user.user_id === currentUser.user_id) {
      fetchCounts(currentUser.user_id);
    }
  }, [user.user_id, currentUser]);

  const handleFollow = async () => {
    await fetch(`http://localhost:3000/users/${user.user_id}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ follower_id: currentUser.user_id })
    });
    setIsFollowing(true);
    setFollowers(f => f + 1);
    // Solo actualiza "siguiendo" si es tu propio perfil
    if (user.user_id === currentUser.user_id) {
      fetch(`http://localhost:3000/users/${currentUser.user_id}/following-count`)
        .then(res => res.json())
        .then(data => setFollowing(data.following || 0));
    }
  };
  const handleUnfollow = async () => {
    await fetch(`http://localhost:3000/users/${user.user_id}/follow`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ follower_id: currentUser.user_id })
    });
    setIsFollowing(false);
    setFollowers(f => Math.max(0, f - 1));
    // Si soy yo, actualiza mi contador de following
    if (currentUser.user_id === currentUser.user_id) {
      fetch(`http://localhost:3000/users/${currentUser.user_id}/following-count`)
        .then(res => res.json())
        .then(data => setFollowing(data.following || 0));
    }
  };
  const [tab, setTab] = useState('tweets');
  const [likedTweets, setLikedTweets] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  useEffect(() => {
    if (tab === 'likes') {
      setLoadingLikes(true);
      fetch(`http://localhost:3000/users/${user.user_id}/liked-tweets`)
        .then(async res => {
          let data;
          try {
            data = await res.json();
          } catch (jsonErr) {
            setLikedTweets([]);
            setLoadingLikes(false);
            console.error('Error al cargar likes: No se pudo procesar la respuesta del servidor.');
            return;
          }
          if (res.ok && Array.isArray(data)) {
            setLikedTweets(data);
          } else {
            setLikedTweets([]);
            console.error('Error al cargar likes:', data.error || data);
          }
          setLoadingLikes(false);
        })
        .catch(err => {
          setLikedTweets([]);
          setLoadingLikes(false);
          console.error('Error al cargar likes: No se pudo conectar con el servidor.');
        });
    }
  }, [tab, user.user_id]);

  if (!user) return <div className="p-8 text-white">No autenticado</div>;
  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar active="profile" navigate={navigate} onLogout={onLogout} />
      {/* Main Content */}
      <div className="flex-1 ml-64 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="sticky top-0 bg-black bg-opacity-80 backdrop-blur border-b border-gray-800 p-6 z-10 flex items-center gap-6">
          <img
            src="https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
            alt="avatar"
            className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg object-cover cursor-pointer"
            onClick={() => navigate(`/profile/${user.user_id}`)}
          />
          <div>
            <div className="text-3xl font-bold text-blue-400">{user.username}</div>
            <div className="text-gray-400 text-lg">@{user.username}</div>
            {/* Contadores siempre visibles, botón seguir solo si no es mi perfil */}
            {currentUser && (
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-300">{followers} seguidores</span>
                <span className="text-sm text-gray-300">{following} siguiendo</span>
                {user.user_id !== currentUser.user_id && (
                  isFollowing ? (
                    <button className="ml-4 px-4 py-1 rounded-full bg-gray-700 text-white border border-blue-400 hover:bg-blue-400 hover:text-black transition" onClick={handleUnfollow}>
                      Dejar de seguir
                    </button>
                  ) : (
                    <button className="ml-4 px-4 py-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition" onClick={handleFollow}>
                      Seguir
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
        <main className="py-8 px-4">
          <div className="flex gap-8 border-b border-gray-800 mb-6">
            <button
              className={`pb-2 font-bold ${tab === 'tweets' ? 'border-b-4 border-blue-400 text-blue-400' : 'text-gray-400'}`}
              onClick={() => setTab('tweets')}
            >Mis Tweets</button>
            <button
              className={`pb-2 font-bold ${tab === 'likes' ? 'border-b-4 border-blue-400 text-blue-400' : 'text-gray-400'}`}
              onClick={() => setTab('likes')}
            >Me gusta</button>
          </div>
          {tab === 'tweets' ? (
            tweets.length === 0 ? (
              <div className="text-gray-400">No tienes tweets aún.</div>
            ) : (
              <TweetList tweets={tweets} user_id={user.user_id} navigate={navigate} />
            )
          ) : (
            loadingLikes ? (
              <div className="text-gray-400">Cargando tweets que te gustaron...</div>
            ) : likedTweets.length === 0 ? (
              <div className="text-gray-400">No has dado me gusta a ningún tweet.</div>
            ) : (
              <TweetList tweets={likedTweets} user_id={user.user_id} navigate={navigate} />
            )
          )}
        </main>
      </div>
    </div>
  );
}

export default Profile;
