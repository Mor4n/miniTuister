import React, { useState } from "react";
import TweetForm from "./TweetForm";
import Tweet from "./Tweet";
//se usa algo llamado "threading"
function ThreadTweet({ tweet, user_id, navigate, isCurrentTweet, isLastInThread, showConnector, isReply, replyCount }) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [likes, setLikes] = useState(0);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [authorProfile, setAuthorProfile] = useState({
    full_name: null,
    bio: null,
    avatar_url: null
  });

  // Función para cargar el perfil del autor del tweet
  const fetchAuthorProfile = async () => {
    try {
      let authorId = tweet.user_id;
      if (typeof authorId === 'object' && authorId !== null) {
        authorId = authorId.user_id || authorId.id || '';
      }
      
      if (authorId && typeof authorId === 'string' && authorId.length > 0) {
        const response = await fetch(`http://localhost:3000/users/${authorId}/profile`);
        if (response.ok) {
          const data = await response.json();
          setAuthorProfile({
            full_name: data.full_name,
            bio: data.bio,
            avatar_url: data.avatar_url
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar perfil del autor:', error);
    }
  };

  // Cargar cantidad de respuestas al montar
  React.useEffect(() => {
    fetch(`http://localhost:3000/tweets/${tweet.id}/replies`)
      .then(res => res.json())
      .then(data => setReplies(data));
    // eslint-disable-next-line
  }, [tweet.id]);

  // Obtener likes y si el usuario ya dio like
  const fetchLikes = async () => {
    const res = await fetch(`http://localhost:3000/tweets/${tweet.id}/likes`);
    const data = await res.json();
    setLikes(data.likes || 0);
    // Consultar si el usuario ya dio like
    const safeUserId = typeof user_id === 'string' ? user_id : (user_id && user_id.user_id ? user_id.user_id : '');
    if (safeUserId) {
      const res2 = await fetch(`http://localhost:3000/tweets/${tweet.id}/likes?user_id=${safeUserId}`);
      const data2 = await res2.json();
      setLiked(data2.liked || false);
    } else {
      setLiked(false);
    }
  };

  // Dar like
  const handleLike = async () => {
    if (liked) return;
    setLiking(true);
    await fetch(`http://localhost:3000/tweets/${tweet.id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id })
    });
    setLiking(false);
    fetchLikes();
  };

  // Quitar like
  const handleUnlike = async () => {
    if (!liked) return;
    setLiking(true);
    await fetch(`http://localhost:3000/tweets/${tweet.id}/like`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id })
    });
    setLiking(false);
    fetchLikes();
  };

  const username = tweet.username || "Usuario";

  const handleTweetClick = (e) => {
    // Evitar navegación si se hace clic en botones o enlaces
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('[data-no-navigate]')) {
      return;
    }
    if (!isCurrentTweet) {
      navigate(`/tweet/${tweet.id}`);
    }
  };

  // Obtener respuestas
  const fetchReplies = async () => {
    setLoadingReplies(true);
    const res = await fetch(`http://localhost:3000/tweets/${tweet.id}/replies`);
    const data = await res.json();
    setReplies(data);
    setLoadingReplies(false);
  };



  // Borrar tweet
  const handleDelete = async () => {
    await fetch(`http://localhost:3000/tweets/${tweet.id}`, { method: 'DELETE' });
    setDeleted(true);
  };

  // Mostrar respuestas al abrir
  const handleShowReplies = () => {
    setShowReplies(!showReplies);
    if (!showReplies) fetchReplies();
  };

  // Manejar nueva respuesta desde TweetForm
  const handleNewReply = async (tweetData) => {
    // Obtener username del localStorage/JWT si existe
    let username = null;
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const jwt_decode_mod = await import('jwt-decode');
        const decode = jwt_decode_mod.default ? jwt_decode_mod.default : jwt_decode_mod;
        const decoded = decode(token);
        username = decoded.username || decoded.user || decoded.name;
      }
    } catch {}
    
    const response = await fetch(`http://localhost:3000/tweets/${tweet.id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, username, content: tweetData.text })
    });
    
    if (response.ok) {
      const newTweet = await response.json();
      // Navegar a la nueva respuesta recién creada
      navigate(`/tweet/${newTweet.id}`);
    } else {
      // Si hay error, recargar la página actual para mostrar la nueva respuesta
      console.error('Error al crear la respuesta');
      window.location.reload();
    }
  };

  // Cargar likes y perfil del autor al montar
  React.useEffect(() => {
    fetchLikes();
    fetchAuthorProfile();
    // eslint-disable-next-line
  }, []);

  if (deleted) return null;

  return (
    <div className="relative mb-4">
      {/* Línea conectora del hilo */}
      {showConnector && !isLastInThread && (
        <div className="absolute left-8 top-20 bottom-[-16px] w-0.5 bg-blue-400 z-0"></div>
      )}
      
      {/* Tweet content */}
      <div 
        className={`relative z-10 flex gap-3 bg-gray-900 p-4 rounded-xl shadow border border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors ${
          isCurrentTweet ? 'ring-2 ring-blue-500 bg-gray-800' : ''
        }`}
        onClick={handleTweetClick}
      >
        {/* Indicador de tweet actual */}
        {isCurrentTweet && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            Tweet actual
          </div>
        )}
        
        <img
          src={authorProfile.avatar_url ? `http://localhost:3005${authorProfile.avatar_url}` : "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover border border-gray-600 cursor-pointer"
          data-no-navigate
          onClick={(e) => {
            e.stopPropagation();
            let uuid = tweet.user_id;
            if (typeof uuid === 'object' && uuid !== null) {
              uuid = uuid.user_id || uuid.id || '';
            }
            if (uuid && typeof uuid === 'string' && uuid.length > 0) {
              navigate(`/profile/${uuid}`);
            } else {
              console.error('user_id inválido para navegación de perfil:', tweet);
            }
          }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span 
              className="font-bold text-white cursor-pointer hover:underline" 
              data-no-navigate
              onClick={(e) => {
                e.stopPropagation();
                let uuid = tweet.user_id;
                if (typeof uuid === 'object' && uuid !== null) {
                  uuid = uuid.user_id || uuid.id || '';
                }
                if (uuid && typeof uuid === 'string' && uuid.length > 0) {
                  navigate(`/profile/${uuid}`);
                } else {
                  console.error('user_id inválido para navegación de perfil:', tweet);
                }
              }}
            >
              {authorProfile.full_name || username}
            </span>
            <span 
              className="text-gray-400 text-sm cursor-pointer hover:underline" 
              data-no-navigate
              onClick={(e) => {
                e.stopPropagation();
                let uuid = tweet.user_id;
                if (typeof uuid === 'object' && uuid !== null) {
                  uuid = uuid.user_id || uuid.id || '';
                }
                if (uuid && typeof uuid === 'string' && uuid.length > 0) {
                  navigate(`/profile/${uuid}`);
                } else {
                  console.error('user_id inválido para navegación de perfil:', tweet);
                }
              }}
            >
              @{username}
            </span>
            <span className="text-gray-500 text-xs ml-auto">{tweet.date || tweet.created_at}</span>
            {String(tweet.user_id) === String(user_id) && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }} 
                className="ml-2 text-xs text-red-500 hover:underline"
              >
                Borrar
              </button>
            )}
          </div>
            
            <div className="mt-2 text-white text-base whitespace-pre-line break-words">
              {tweet.text || tweet.content}
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-8 mt-3 text-gray-400" data-no-navigate>
              <button 
                className="flex items-center gap-1 hover:text-blue-500 transition relative" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/tweet/${tweet.id}`);
                }}
              >
                {/* Icono de ver respuestas */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
                <span className="text-sm">Ver respuestas</span>
                <span className={
                  `ml-2 px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer ` +
                  (replies.length > 0 ? 'bg-blue-100 text-blue-600 border border-blue-200 hover:bg-blue-200' : 'bg-gray-200 text-gray-400 border border-gray-300')
                }>
                  {replies.length}
                </span>
              </button>
              <button className="flex items-center gap-1 hover:text-green-500 transition relative" onClick={() => setShowReplyForm(!showReplyForm)}>
                {/* Icono de responder */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25H7.5A2.25 2.25 0 0 1 5.25 12V6.75A2.25 2.25 0 0 1 7.5 4.5h9A2.25 2.25 0 0 1 18.75 6.75V12a2.25 2.25 0 0 1-2.25 2.25H15M9 14.25l-3 3m0 0l3 3m-3-3h12" />
                </svg>
                <span className="text-sm">Responder</span>
              </button>
              {liked ? (
                <button
                  className="flex items-center gap-1 transition text-pink-500 hover:text-gray-400"
                  onClick={handleUnlike}
                  disabled={liking}
                  title="Me gusta"
                >
                  {/* Icono de corazón lleno */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.239-4.5-5-4.5-1.657 0-3.156.832-4 2.09C10.156 4.582 8.657 3.75 7 3.75c-2.761 0-5 2.015-5 4.5 0 7.25 10 12 10 12s10-4.75 10-12z" />
                  </svg>
                  <span className="text-sm">Me gusta</span>
                  <span className="ml-1 text-xs">{likes}</span>
                </button>
              ) : (
                <button
                  className="flex items-center gap-1 transition hover:text-pink-500"
                  onClick={handleLike}
                  disabled={liking}
                  title="Me gusta"
                >
                  {/* Icono de corazón vacío */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.239-4.5-5-4.5-1.657 0-3.156.832-4 2.09C10.156 4.582 8.657 3.75 7 3.75c-2.761 0-5 2.015-5 4.5 0 7.25 10 12 10 12s10-4.75 10-12z" />
                  </svg>
                  <span className="text-sm">Me gusta</span>
                  <span className="ml-1 text-xs">{likes}</span>
                </button>
              )}
            </div>

            {/* Formulario de respuesta con TweetForm */}
            {showReplyForm && (
              <div className="mt-4">
                <TweetForm onTweet={handleNewReply} />
              </div>
            )}

            {/* Ver respuestas existentes */}
            {showReplies && (
              <div className="mt-4">
                {loadingReplies ? (
                  <div className="text-xs text-gray-400 p-4">Cargando respuestas...</div>
                ) : (
                  <div className="space-y-4">
                    {replies.length === 0 && <div className="text-xs text-gray-400 p-4">Sin respuestas</div>}
                    {replies.map((reply) => (
                      <Tweet 
                        key={reply.id}
                        tweet={reply} 
                        user_id={user_id} 
                        navigate={navigate}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mostrar link a sub-respuestas si es una respuesta con replies */}
            {/* COMENTADO: Ya usamos el botón "Ver respuestas" de arriba que hace lo mismo */}
            {/* {isReply && replyCount > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                <span className="hover:text-blue-400 cursor-pointer transition-colors" 
                      onClick={() => navigate(`/tweet/${tweet.id}`)}>
                  Ver {replyCount} respuesta{replyCount > 1 ? 's' : ''} →
                </span>
              </div>
            )} */}
        </div>
      </div>
    </div>
  );
}

export default ThreadTweet;