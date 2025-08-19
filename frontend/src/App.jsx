import React from "react";
import VideoCard from "./components/VideoCard";

const videos = [
  {
    id: 1,
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    username: "john_doe",
    caption: "Check out this awesome video!",
    likes: 120,
    comments: 34,
  },
  {
    id: 2,
    url: "https://www.w3schools.com/html/movie.mp4",
    username: "jane_smith",
    caption: "Amazing view from the top!",
    likes: 200,
    comments: 50,
  },
  {
    id: 3,
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    username: "alex90",
    caption: "Another cool video!",
    likes: 75,
    comments: 12,
  },
];

function App() {
  return (
    <div className="h-screen w-screen snap-y snap-mandatory overflow-y-scroll scroll-smooth">
      {videos.map((video) => (
        <div key={video.id} className="h-screen w-full snap-start">
          <VideoCard video={video} />
        </div>
      ))}
    </div>
  );
}

export default App;
