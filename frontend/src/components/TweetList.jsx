import React from "react";
import Tweet from "./Tweet";

function TweetList({ tweets }) {
  return (
    <div className="flex flex-col gap-3">
      {tweets.map((tweet, idx) => (
        <Tweet key={idx} tweet={tweet} />
      ))}
    </div>
  );
}

export default TweetList;
