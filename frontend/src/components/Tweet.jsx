
import React, { useState } from "react";

function Tweet({ tweet, user_id, navigate }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  // Cargar cantidad de respuestas al montar
  React.useEffect(() => {
    fetch(`http://localhost:3000/tweets/${tweet.id}/replies`)
      .then(res => res.json())
      .then(data => setReplies(data));
    // eslint-disable-next-line
  }, [tweet.id]);
  const [deleted, setDeleted] = useState(false);
  const [likes, setLikes] = useState(0);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
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

  // Obtener user_id y username del tweet
  const username = tweet.username || "Usuario";

  // Obtener respuestas
  const fetchReplies = async () => {
    setLoadingReplies(true);
  const res = await fetch(`http://localhost:3000/tweets/${tweet.id}/replies`);
    const data = await res.json();
    setReplies(data);
    setLoadingReplies(false);
  };

  // Enviar respuesta
  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
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
    await fetch(`http://localhost:3000/tweets/${tweet.id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, username, content: replyText })
    });
    setReplyText("");
    fetchReplies();
  };

  // Borrar tweet
  const handleDelete = async () => {
  await fetch(`http://localhost:3000/tweets/${tweet.id}`, { method: 'DELETE' });
    setDeleted(true);
  };

  // Mostrar respuestas al abrir
  const handleShowReplies = () => {
    setShowReply(!showReply);
    if (!showReply) fetchReplies();
  };

  // Cargar likes al montar
  React.useEffect(() => {
    fetchLikes();
    // eslint-disable-next-line
  }, []);

  if (deleted) return null;

  return (
    <div className="flex gap-3 bg-white p-4 rounded-xl shadow border border-gray-200">
      <img
        src="https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
        alt="avatar"
        className="w-12 h-12 rounded-full object-cover border border-gray-300 cursor-pointer"
        onClick={() => {
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
          <span className="font-bold text-gray-800 cursor-pointer" onClick={() => {
            let uuid = tweet.user_id;
            if (typeof uuid === 'object' && uuid !== null) {
              uuid = uuid.user_id || uuid.id || '';
            }
            if (uuid && typeof uuid === 'string' && uuid.length > 0) {
              navigate(`/profile/${uuid}`);
            } else {
              console.error('user_id inválido para navegación de perfil:', tweet);
            }
          }}>{username}</span>
          <span className="text-gray-500 text-sm cursor-pointer" onClick={() => {
            let uuid = tweet.user_id;
            if (typeof uuid === 'object' && uuid !== null) {
              uuid = uuid.user_id || uuid.id || '';
            }
            if (uuid && typeof uuid === 'string' && uuid.length > 0) {
              navigate(`/profile/${uuid}`);
            } else {
              console.error('user_id inválido para navegación de perfil:', tweet);
            }
          }}>@{username}</span>
          <span className="text-gray-400 text-xs ml-auto">{tweet.date || tweet.created_at}</span>
          {String(tweet.user_id) === String(user_id) && (
            <button onClick={handleDelete} className="ml-2 text-xs text-red-500 hover:underline">Borrar</button>
          )}
        </div>
        <div className="mt-2 text-gray-900 text-base whitespace-pre-line break-words">
          {tweet.text || tweet.content}
        </div>
        {/* Botones de acción */}
        <div className="flex gap-8 mt-3 text-gray-500">
          <button className="flex items-center gap-1 hover:text-blue-500 transition relative" onClick={handleShowReplies}>
            {/* Icono de respuesta */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25H7.5A2.25 2.25 0 0 1 5.25 12V6.75A2.25 2.25 0 0 1 7.5 4.5h9A2.25 2.25 0 0 1 18.75 6.75V12a2.25 2.25 0 0 1-2.25 2.25H15M9 14.25l-3 3m0 0l3 3m-3-3h12" />
            </svg>
            <span className="text-sm">Responder</span>
            <span className={
              `ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ` +
              (replies.length > 0 ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-gray-200 text-gray-400 border border-gray-300')
            }>
              {replies.length}
            </span>
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

        {/* Respuestas */}
        {showReply && (
          <div className="mt-4 bg-gray-50 rounded p-3">
            <form onSubmit={handleReply} className="flex gap-2 mb-2">
              <input
                className="flex-1 border rounded px-2 py-1 text-sm text-gray-900 placeholder-gray-500 bg-gray-100"
                placeholder="Escribe una respuesta..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
              />
              <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Responder</button>
            </form>
            {loadingReplies ? (
              <div className="text-xs text-gray-400">Cargando respuestas...</div>
            ) : (
              <div className="space-y-2">
                {replies.length === 0 && <div className="text-xs text-gray-400">Sin respuestas</div>}
                {replies.map((r) => (
                  <div key={r.id} className="flex gap-2 items-start">
                    <img src="https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png" alt="avatar" className="w-7 h-7 rounded-full border border-gray-300" />
                    <div>
                      <div className="text-xs text-gray-800 font-bold">{r.username || "Usuario"}</div>
                      <div className="text-xs text-gray-600">{r.content}</div>
                      <div className="text-xs text-gray-400">{r.created_at}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tweet;
