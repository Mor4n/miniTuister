import React from "react";
import Tweet from "./Tweet";

function TweetList({ tweets, user_id, navigate }) {
  return (
    <div className="flex flex-col gap-3">
      {tweets.map((tweet, idx) => (
        <Tweet key={idx} tweet={tweet} user_id={user_id} navigate={navigate} />
      ))}
    </div>
  );
}

export default TweetList;
