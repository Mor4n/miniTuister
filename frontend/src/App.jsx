import React, { useState, useEffect } from "react";

import TweetForm from "./components/TweetForm";
import TweetList from "./components/TweetList";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Sidebar from "./components/Sidebar";
import UserSearch from "./components/UserSearch";
import Gork from "./components/Gork";
import { jwtDecode } from "jwt-decode";
import TweetSearchFeed from "./components/TweetSearchFeed";
import TweetDetail from "./components/TweetDetail";

function App() {
  // Tweet search hooks
  const [tweetSearchResults, setTweetSearchResults] = useState([]);
  const [tweetSearchLoading, setTweetSearchLoading] = useState(false);
  const [tweetSearchQuery, setTweetSearchQuery] = useState("");

  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(window.location.pathname);
  const [profileUserId, setProfileUserId] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [profileUserData, setProfileUserData] = useState(null);

  const [tab, setTab] = useState("para-ti"); // "para-ti" o "seguidos"

  // Función para obtener datos de un usuario específico desde todos los tweets
  const getUserDataFromTweets = (userId) => {
    console.log('Buscando usuario con ID:', userId);
    console.log('Tweets disponibles:', tweets.length);
    console.log('Primeros 3 tweets:', tweets.slice(0, 3));
    
    // Primero buscar en los tweets cargados
    const userFromTweets = tweets.find(t => String(t.user_id) === String(userId));
    console.log('Usuario encontrado en tweets:', userFromTweets);
    
    if (userFromTweets && userFromTweets.username) {
      console.log('Retornando usuario con username:', userFromTweets.username);
      return {
        user_id: userId,
        username: userFromTweets.username
      };
    }
    
    // Si no se encuentra, usar valores por defecto pero intentar cargar todos los tweets
    console.log('Usuario no encontrado, usando valores por defecto');
    return {
      user_id: userId,
      username: 'usuario'
    };
  };

  // Cargar tweets para "Para ti"
  const fetchParaTiTweets = () => {
    setLoading(true);
    fetch("http://localhost:3000/tweets")
      .then((res) => res.json())
      .then((data) => {
        setTweets(data);
        setLoading(false);
      });
  };

  // Cargar tweets para "Seguidos"
  const fetchSeguidosTweets = () => {
    setLoading(true);
    fetch(`http://localhost:3000/feed/${user.user_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTweets(data);
        } else {
          setTweets([]); // Si no hay tweets, muestra el mensaje
        }
        setLoading(false);
      });
  };

  // Manejar cambio de tab
  useEffect(() => {
    if (tab === "para-ti") {
      fetchParaTiTweets();
    } else if (tab === "seguidos") {
      fetchSeguidosTweets();
    }
  }, [tab]);

  // Resetear a "Para ti" cuando se navega a home
  useEffect(() => {
    if (route === '/') {
      setTab("para-ti");
    }
  }, [route]);

  // Buscar tweets por palabra clave y redirigir
  const handleSearchTweets = (query) => {
    navigate(`/search/tweets?query=${encodeURIComponent(query)}`);
  };

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
      setProfileUserData(null);
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

  // Función para cargar TODOS los tweets disponibles (para obtener usernames)
  const fetchAllTweets = () => {
    setLoading(true);
    fetch("http://localhost:3000/tweets")
      .then((res) => res.json())
      .then((data) => {
        setTweets(data);
        setLoading(false);
      })
      .catch(() => {
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
    
    if (!safeProfileUserId) {
      return <div className="p-8 text-red-400">Perfil de usuario no válido.</div>;
    }
    
    // Priorizar datos del usuario si los tenemos de la búsqueda
    let profileUser;
    if (profileUserData && String(profileUserData.user_id) === String(safeProfileUserId)) {
      console.log('Usando datos de búsqueda:', profileUserData);
      profileUser = {
        user_id: safeProfileUserId,
        username: profileUserData.username
      };
    } else {
      console.log('Usando datos de tweets');
      profileUser = getUserDataFromTweets(safeProfileUserId);
      
      // Si no encontramos el usuario en tweets y no estamos cargando, cargar tweets
      if (profileUser.username === 'usuario' && !loading) {
        fetchAllTweets();
      }
    }
    
    // Solo mostrar loading en layout completo si realmente estamos cargando y no tenemos datos
    if (loading && !profileUserData && profileUser.username === 'usuario') {
      return (
        <div className="min-h-screen bg-black text-white flex">
          <Sidebar onLogout={handleLogout} active="profile" navigate={navigate} />
          <main className="flex-1 ml-64 max-w-2xl border-x border-gray-800 min-h-screen">
            <div className="p-8 text-gray-400">Cargando perfil...</div>
          </main>
          <aside className="w-80 p-4 space-y-4 hidden lg:block">
            <div className="sticky top-4">
              <UserSearch
                onSelect={user => {
                  setProfileUserData(user);
                  navigate(`/profile/${user.user_id}`);
                }}
                onSearchTweets={handleSearchTweets}
              />
            </div>
          </aside>
        </div>
      );
    }
    
    return <Profile user={profileUser} currentUser={user} tweets={tweets.filter(t => String(t.user_id) === safeProfileUserId)} onLogout={handleLogout} navigate={navigate} />;
  }

  // Ruta para tweet individual
  if (route.startsWith('/tweet/')) {
    const tweetId = route.split('/tweet/')[1];
    if (!tweetId) {
      return <div className="p-8 text-red-400">Tweet ID no válido</div>;
    }
    return <TweetDetail tweetId={tweetId} user={user} navigate={navigate} onLogout={handleLogout} handleSearchTweets={handleSearchTweets} />;
  }

  // Ruta para Gork (Chatbot)
  if (route === '/gork') {
    return (
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar onLogout={handleLogout} active="gork" navigate={navigate} />
        <main className="flex-1 ml-64">
          <Gork user={user} />
        </main>
      </div>
    );
  }

  // Página de resultados de búsqueda de tweets
  if (route.startsWith('/search/tweets')) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query') || '';
    return (
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar onLogout={handleLogout} active={"search"} navigate={navigate} />
        <main className="flex-1 ml-64 max-w-2xl border-x border-gray-800 min-h-screen">
          <TweetSearchFeed query={query} navigate={navigate} user_id={user?.user_id} />
        </main>
        <aside className="w-80 p-4 space-y-4 hidden lg:block">
          <div className="sticky top-4">
            <UserSearch
              onSelect={user => {
                // Guardar los datos del usuario y navegar
                setProfileUserData(user);
                navigate(`/profile/${user.user_id}`);
              }}
              onSearchTweets={handleSearchTweets}
            />
          </div>
        </aside>
      </div>
    );
  }

  // Resto de la app (usuario autenticado)
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} active={route === '/profile' ? 'profile' : route === '/gork' ? 'gork' : 'home'} navigate={navigate} />

      {/* Main Content */}
      <main className="flex-1 ml-64 max-w-2xl border-x border-gray-800 min-h-screen">
        {/* Header con tabs */}
        <div className="sticky top-0 bg-black bg-opacity-80 backdrop-blur border-b border-gray-800 p-4 z-10">
          <div className="flex gap-8 justify-center">
            <button
              className={`pb-2 font-bold ${
                tab === "para-ti"
                  ? "border-b-4 border-blue-400 text-blue-400"
                  : "text-gray-400"
              }`}
              onClick={() => setTab("para-ti")}
            >
              Para ti
            </button>
            <button
              className={`pb-2 font-bold ${
                tab === "seguidos"
                  ? "border-b-4 border-blue-400 text-blue-400"
                  : "text-gray-400"
              }`}
              onClick={() => setTab("seguidos")}
            >
              Seguidos
            </button>
          </div>
        </div>
        {/* Tweet Composer */}
        <div className="border-b border-gray-800 p-4">
          <TweetForm onTweet={addTweet} />
        </div>
        {/* Timeline */}
        <div className="p-4">
          {loading ? (
            <div className="text-gray-400">Cargando tweets...</div>
          ) : tweets.length > 0 ? (
            <TweetList tweets={tweets.filter(tweet => tweet.reply_to === null || tweet.reply_to === undefined)} user_id={user?.user_id} navigate={navigate} />
          ) : (
            <div className="text-gray-400 text-center mt-8">
              {tab === "seguidos"
                ? "Aún no tienes seguidos :("
                : "No se encontraron tweets."}
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 p-4 space-y-4 hidden lg:block">
        {/* Search - esquina superior derecha tipo Twitter */}
        <div className="sticky top-4">
          <UserSearch
            onSelect={user => {
              // Guardar los datos del usuario y navegar
              setProfileUserData(user);
              navigate(`/profile/${user.user_id}`);
            }}
            onSearchTweets={handleSearchTweets}
          />
        </div>
        {/* ...otros widgets del sidebar derecho... */}
      </aside>
    </div>
  );
}

export default App;