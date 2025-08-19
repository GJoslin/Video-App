import React, { useState, useEffect } from 'react';
import VideoCard from "./components/VideoCard";
import TopNavBar from "./components/TopNavBar";
import BottomNavBar from "./components/BottomNavBar";

// Enhanced mock video data
const videos = [
  {
    id: 1,
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    username: "creativecoder",
    displayName: "Creative Coder ✨",
    caption: "When your code finally works after debugging for 3 hours 😅 #coding #developer #programming",
    likes: 24500,
    comments: 1200,
    shares: 850,
    bookmarks: 320,
    music: "Original Sound - creativecoder",
    isLiked: false,
    isBookmarked: false,
    isFollowing: false,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 2,
    url: "https://www.w3schools.com/html/movie.mp4",
    username: "techguru22",
    displayName: "Tech Guru 🚀",
    caption: "Latest AI trends that will blow your mind! Which one surprised you the most? 🤖 #ai #technology #future",
    likes: 45200,
    comments: 3400,
    shares: 1200,
    bookmarks: 890,
    music: "Tech Vibes - Electronic Mix",
    isLiked: true,
    isBookmarked: false,
    isFollowing: true,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b95aba98?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 3,
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    username: "designpro",
    displayName: "Design Pro 🎨",
    caption: "Quick UI design tips that every developer should know! Save this for later 📌 #design #ui #webdesign",
    likes: 18700,
    comments: 890,
    shares: 560,
    bookmarks: 1200,
    music: "Chill Beats - Lo-Fi Mix",
    isLiked: false,
    isBookmarked: true,
    isFollowing: false,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  }
];

function App() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Handle swipe gestures
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
    if (isDownSwipe && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp' && currentVideoIndex > 0) {
        setCurrentVideoIndex(currentVideoIndex - 1);
      } else if (e.key === 'ArrowDown' && currentVideoIndex < videos.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentVideoIndex]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <TopNavBar />
      
      {/* Video Container */}
      <div
        className="h-full w-full relative transition-transform duration-500 ease-out"
        style={{
          transform: `translateY(-${currentVideoIndex * 100}vh)`
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {videos.map((video, index) => (
          <div key={video.id} className="absolute top-0 left-0 w-full h-full" style={{ top: `${index * 100}vh` }}>
            <VideoCard 
              video={video} 
              isActive={index === currentVideoIndex}
            />
          </div>
        ))}
      </div>

      <BottomNavBar />
      
      {/* Progress Indicator */}
      <div className="fixed left-2 top-1/2 transform -translate-y-1/2 space-y-2 z-30">
        {videos.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-8 rounded-full transition-all duration-300 ${
              index === currentVideoIndex ? 'bg-white' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default App;