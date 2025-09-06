import React from "react";

function Tweet({ tweet }) {
  return (
    <div className="flex gap-3 bg-white p-4 rounded-xl shadow border border-gray-200">
      <img
        src="https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
        alt="avatar"
        className="w-12 h-12 rounded-full object-cover border border-gray-300"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800">Usuario</span>
          <span className="text-gray-500 text-sm">@usuario</span>
          <span className="text-gray-400 text-xs ml-auto">{tweet.date}</span>
        </div>
        <div className="mt-2 text-gray-900 text-base whitespace-pre-line break-words">
          {tweet.text}
        </div>
        {/* Botones de acción */}
        <div className="flex gap-8 mt-3 text-gray-500">
          <button className="flex items-center gap-1 hover:text-blue-500 transition">
            {/* Icono de respuesta */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25H7.5A2.25 2.25 0 0 1 5.25 12V6.75A2.25 2.25 0 0 1 7.5 4.5h9A2.25 2.25 0 0 1 18.75 6.75V12a2.25 2.25 0 0 1-2.25 2.25H15M9 14.25l-3 3m0 0l3 3m-3-3h12" />
            </svg>
            <span className="text-sm">Responder</span>
          </button>
          <button className="flex items-center gap-1 hover:text-pink-500 transition">
            {/* Icono de corazón */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.239-4.5-5-4.5-1.657 0-3.156.832-4 2.09C10.156 4.582 8.657 3.75 7 3.75c-2.761 0-5 2.015-5 4.5 0 7.25 10 12 10 12s10-4.75 10-12z" />
            </svg>
            <span className="text-sm">Me gusta</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Tweet;
