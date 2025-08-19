import VideoCard from "../components/VideoCard";

const videos = [
  { id: 1, url: "https://www.w3schools.com/html/mov_bbb.mp4", caption: "First video", likes: 120, comments: 45 },
  { id: 2, url: "https://www.w3schools.com/html/movie.mp4", caption: "Second video", likes: 90, comments: 22 },
];

function Feed() {
  return (
    <div className="snap-y snap-mandatory h-screen overflow-scroll">
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} />
      ))}
    </div>
  );
}

export default Feed;
