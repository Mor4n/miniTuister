// Archivo eliminado, usar TweetList.jsx
import React from "react";
import Tweet from "./Tweet";


interface TweetType {
  text: string;
  date: string;
}

interface TweetListProps {
  tweets: TweetType[];
}

const TweetList: React.FC<TweetListProps> = ({ tweets }) => {
  return (
    <div className="flex flex-col gap-3">
      {tweets.map((tweet, idx) => (
        <Tweet key={idx} tweet={tweet} />
      ))}
    </div>
  );
};

export default TweetList;
