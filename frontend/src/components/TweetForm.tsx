// Archivo eliminado, usar TweetForm.jsx
import React, { useState } from "react";

interface TweetFormProps {
  onTweet: (tweet: { text: string; date: string }) => void;
}

const TweetForm: React.FC<TweetFormProps> = ({ onTweet }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === "") return;
    onTweet({ text, date: new Date().toLocaleString() });
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3 bg-white rounded-xl shadow p-4 mb-6 border border-gray-200">
      <img
        src="https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
        alt="avatar"
        className="w-12 h-12 rounded-full object-cover border border-gray-300"
      />
      <div className="flex-1 flex flex-col">
        <textarea
          className="w-full p-3 border-none focus:ring-0 focus:outline-none text-lg resize-none bg-gray-100 rounded-xl"
          rows={3}
          placeholder="¿Qué está pasando?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={280}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-full shadow transition disabled:opacity-50"
            disabled={text.trim() === ""}
          >
            Twittear
          </button>
        </div>
      </div>
    </form>
  );
};

export default TweetForm;
