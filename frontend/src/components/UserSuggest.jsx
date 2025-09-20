import React, { useState, useRef } from "react";

function UserSuggest({ value, onChange }) {
  const [results, setResults] = useState([]);
  const [showList, setShowList] = useState(false);
  const inputRef = useRef();

  // Detecta si hay una arroba y busca usuarios
  const handleChange = async (e) => {
    const val = e.target.value;
    onChange(val);
    const match = val.match(/@(\w{2,})$/);
    if (match) {
      const searchTerm = match[1];
      try {
        const res = await fetch(`http://localhost:3000/search/users?query=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setResults(data);
          setShowList(true);
        } else {
          setResults([]);
          setShowList(false);
        }
      } catch {
        setResults([]);
        setShowList(false);
      }
    } else {
      setResults([]);
      setShowList(false);
    }
  };

  const handleSelect = (user) => {
    onChange(value.replace(/@\w*$/, `@${user.username} `));
    setShowList(false);
    inputRef.current.focus();
  };

  return (
    <div className="relative w-full">
      <textarea
        ref={inputRef}
        className="w-full p-3 border-none focus:ring-0 focus:outline-none text-lg resize-none rounded-xl text-gray-900 placeholder-gray-500 bg-gray-100"
        rows={3}
        placeholder="¿Qué está pasando?"
        value={value}
        onChange={handleChange}
        onFocus={() => value.includes("@") && setShowList(true)}
        onBlur={() => setTimeout(() => setShowList(false), 150)}
        maxLength={280}
      />
      {showList && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10">
          {results.map((user) => (
            <div
              key={user.id}
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
        </div>
      )}
    </div>
  );
}

export default UserSuggest;
