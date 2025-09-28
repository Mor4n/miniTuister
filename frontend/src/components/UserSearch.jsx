import React, { useState, useRef } from "react";

function UserSearch({ onSelect, onSearchTweets }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const abortRef = useRef();

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (abortRef.current) abortRef.current.abort();
    if (value.length < 2) {
      setResults([]);
      setShowList(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const currentQuery = value;
    try {
      const res = await fetch(`http://localhost:3000/search/users?query=${encodeURIComponent(currentQuery)}`, { signal: controller.signal });
      const data = await res.json();
      // Solo actualiza si el query sigue igual
      if (currentQuery === e.target.value) {
        if (Array.isArray(data)) {
          setResults(data);
          setShowList(true);
        } else {
          setResults([]);
          setShowList(false);
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setResults([]);
        setShowList(false);
      }
    }
    setLoading(false);
  };

const handleSelect = (user) => {
  setQuery("");
  setResults([]);
  setShowList(false);
  // Pasar el objeto completo del usuario en lugar de solo el user_id
  onSelect && onSelect(user);
};

  return (
    <div className="relative w-full">
      <div className="relative">
        {/* Icono de búsqueda */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
          </svg>
        </div>
        <input
          type="text"
          className="w-full py-3 pl-12 pr-4 rounded-full bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-200"
          placeholder="Buscar usuario o tweet..."
          value={query}
          onChange={handleChange}
          onFocus={() => query.length > 1 && setShowList(true)}
          onBlur={() => setTimeout(() => setShowList(false), 150)}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>
      {showList && (results.length > 0 || query.length > 1) && (
        <div className="absolute left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden">
          {results.map((user, idx) => (
            <div
              key={user.id || user.username || idx}
              className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer transition-colors duration-150"
              onMouseDown={() => handleSelect(user)}
            >
              <img
                src={user.avatar_url ? `http://localhost:3005${user.avatar_url}` : "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"}
                alt="avatar"
                className="w-10 h-10 rounded-full border border-gray-600 object-cover"
              />
              <div className="flex-1">
                <div className="font-bold text-white">{user.full_name || user.username}</div>
                <div className="text-gray-400 text-sm">@{user.username}</div>
                {user.bio && (
                  <div className="text-gray-500 text-xs mt-1 line-clamp-1">
                    {user.bio}
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Opción para buscar tweets */}
          <div
            className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer border-t border-gray-700 transition-colors duration-150"
            onMouseDown={() => {
              setShowList(false);
              onSearchTweets && onSearchTweets(query);
            }}
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-blue-400">Buscar "{query}" en tweets</div>
              <div className="text-gray-500 text-sm">Ver todos los tweets relacionados</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserSearch;
