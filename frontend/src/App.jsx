import React, { useState, useEffect } from "react";
import TweetForm from "./components/TweetForm";
import TweetList from "./components/TweetList";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Sidebar from "./components/Sidebar";
import { jwtDecode } from "jwt-decode";


function App() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(window.location.pathname);
  const [profileUserId, setProfileUserId] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  // Decodificar usuario al iniciar o cuando cambia el token
  useEffect(() => {
    console.log('TOKEN in useEffect:', token);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('JWT decoded:', decoded); // <-- depuración
        // Fallback robusto para username
        let username = decoded.username || decoded.user || decoded.name || decoded.email || decoded.sub || decoded.id;
        if (!username && typeof decoded === 'object') {
          // Busca el primer string que parezca username
          for (const key in decoded) {
            if (typeof decoded[key] === 'string' && decoded[key].length > 2) {
              username = decoded[key];
              break;
            }
          }
        }
        setUser({
          user_id: decoded.user_id || decoded.id || decoded.sub,
          username: username || 'usuario'
        });
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  // Manejar navegación simple
  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setRoute(path);
    // Si es perfil de usuario, extrae el user_id
    const match = path.match(/^\/profile\/(.+)$/);
    if (match) {
      setProfileUserId(String(match[1]));
    } else {
      setProfileUserId(null);
    }
  };

  // Manejar login/logout
  const handleLogin = (jwt) => {
    setToken(jwt);
    localStorage.setItem('token', jwt);
    navigate('/');
  };
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };
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
  setTweets(data);
        setLoading(false);
      });
  };

  // Cargar tweets al iniciar
  useEffect(() => {
    fetchTweets();
  }, []);

  // Crear tweet usando el microservicio
  const addTweet = async (tweet) => {
    if (!user) return;
    await fetch("http://localhost:3000/tweets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.user_id, content: tweet.text }),
    });
    fetchTweets();
  };

  // Rutas de autenticación
  if (!token) {
    if (route === '/register') {
      return <Register onRegister={() => navigate('/login')} />;
    }
    return <Login onLogin={handleLogin} />;
  }

  // Perfil
  // Perfil propio
  if (route === '/profile') {
    if (token && user === null) {
      return <div className="p-8">Cargando perfil...</div>;
    }
    return <Profile user={user} currentUser={user} tweets={tweets.filter(t => t.user_id === user?.user_id)} onLogout={handleLogout} navigate={navigate} />;
  }
  // Perfil de otro usuario
  if (route.startsWith('/profile/')) {
    const safeProfileUserId = typeof profileUserId === 'string' ? profileUserId : (profileUserId && profileUserId.user_id ? profileUserId.user_id : '');
    if (loading) {
      return <div className="p-8 text-gray-400">Cargando perfil...</div>;
    }
    if (!safeProfileUserId) {
      return <div className="p-8 text-red-400">Perfil de usuario no válido.</div>;
    }
    const profileUser = tweets.find(t => String(t.user_id) === safeProfileUserId)?.username || 'usuario';
    return <Profile user={{ user_id: safeProfileUserId, username: profileUser }} currentUser={user} tweets={tweets.filter(t => String(t.user_id) === safeProfileUserId)} onLogout={handleLogout} navigate={navigate} />;
  }

  // Resto de la app (usuario autenticado)
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
  <Sidebar onLogout={handleLogout} active={route === '/profile' ? 'profile' : 'home'} navigate={navigate} />

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
            <TweetList tweets={tweets.filter(tweet => tweet.reply_to === null || tweet.reply_to === undefined)} user_id={user?.user_id} navigate={navigate} />
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 p-4 space-y-4 hidden lg:block">
        {/* Search */}
        {/** 
        <div className="bg-gray-900 rounded-full p-3 mb-4">
          <input
            type="text"
            placeholder="Buscar en miniTuister"
            className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 w-full"
          />
        </div>*/}
      </aside>
    </div>
  );
}

export default App;