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
  onSelect && onSelect(user.user_id);
};

  return (
    <div className="relative w-full">
      <input
        type="text"
        className="w-full p-3 rounded bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
        placeholder="Buscar usuario o tweet..."
        value={query}
        onChange={handleChange}
        onFocus={() => query.length > 1 && setShowList(true)}
        onBlur={() => setTimeout(() => setShowList(false), 150)}
      />
      {showList && (results.length > 0 || query.length > 1) && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10">
          {results.map((user, idx) => (
            <div
              key={user.id || user.username || idx}
              className="flex items-center gap-3 p-2 hover:bg-blue-50 cursor-pointer"
              onMouseDown={() => handleSelect(user)}
            >
              <img
                src={user.avatar || "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"}
                alt="avatar"
                className="w-8 h-8 rounded-full border border-gray-300"
              />
              <div>
                <div className="font-bold text-gray-800">{user.username}</div>
                <div className="text-gray-500 text-sm">@{user.username}</div>
              </div>
            </div>
          ))}
          {/* Opción para buscar tweets */}
          <div
            className="flex items-center gap-3 p-2 hover:bg-blue-100 cursor-pointer border-t border-gray-200"
            onMouseDown={() => {
              setShowList(false);
              onSearchTweets && onSearchTweets(query);
            }}
          >
            <span className="font-bold text-blue-500">Buscar "{query}" en tweets</span>
          </div>
        </div>
      )}
      {loading && <div className="absolute right-3 top-3 text-blue-400 text-xs">Buscando...</div>}
    </div>
  );
}

export default UserSearch;
