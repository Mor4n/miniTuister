// Archivo eliminado, usar Tweet.jsx
import React from "react";

interface TweetProps {
  tweet: {
    text: string;
    date: string;
  };
}

const Tweet: React.FC<TweetProps> = ({ tweet }) => {
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
      </div>
    </div>
  );
};

export default Tweet;
