import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Music, Plus } from 'lucide-react';

function VideoCard({ video, isActive }) {
  const videoRef = useRef(null);
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(video.isBookmarked);
  const [isFollowing, setIsFollowing] = useState(video.isFollowing);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleVideoClick = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted
        playsInline
        onClick={handleVideoClick}
      />

      {/* Play/Pause Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[12px] border-y-transparent ml-1"></div>
          </div>
        </div>
      )}

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-20 flex flex-col items-center space-y-6">
        {/* Profile Picture + Follow Button */}
        <div className="relative">
          <img
            src={video.avatar}
            alt={video.username}
            className="w-12 h-12 rounded-full border-2 border-white object-cover"
          />
          {!isFollowing && (
            <button
              onClick={() => setIsFollowing(true)}
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Like Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleLike}
            className={`p-3 rounded-full transition-all duration-200 ${
              isLiked ? 'bg-red-500' : 'bg-black bg-opacity-20'
            }`}
          >
            <Heart 
              className={`w-6 h-6 ${isLiked ? 'text-white fill-current' : 'text-white'}`}
            />
          </button>
          <span className="text-white text-xs mt-1 font-semibold">
            {formatCount(likeCount)}
          </span>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center">
          <button className="p-3 bg-black bg-opacity-20 rounded-full">
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-xs mt-1 font-semibold">
            {formatCount(video.comments)}
          </span>
        </div>

        {/* Bookmark Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-3 rounded-full transition-all duration-200 ${
              isBookmarked ? 'bg-yellow-500' : 'bg-black bg-opacity-20'
            }`}
          >
            <Bookmark 
              className={`w-6 h-6 ${isBookmarked ? 'text-white fill-current' : 'text-white'}`}
            />
          </button>
          <span className="text-white text-xs mt-1 font-semibold">
            {formatCount(video.bookmarks)}
          </span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <button className="p-3 bg-black bg-opacity-20 rounded-full">
            <Share className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-xs mt-1 font-semibold">
            {formatCount(video.shares)}
          </span>
        </div>

        {/* More Options */}
        <button className="p-3 bg-black bg-opacity-20 rounded-full">
          <MoreHorizontal className="w-6 h-6 text-white" />
        </button>

        {/* Spinning Record for Music */}
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-spin-slow flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Bottom Content Overlay */}
      <div className="absolute bottom-0 left-0 right-16 p-4">
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        
        <div className="relative z-10">
          {/* Username and Follow Button */}
          <div className="flex items-center mb-2">
            <span className="text-white font-semibold text-lg">@{video.username}</span>
            {!isFollowing && (
              <button
                onClick={() => setIsFollowing(true)}
                className="ml-3 px-4 py-1 border border-white text-white text-sm font-semibold rounded hover:bg-white hover:text-black transition-all duration-200"
              >
                Follow
              </button>
            )}
          </div>

          {/* Display Name */}
          <p className="text-white text-sm opacity-90 mb-2">{video.displayName}</p>

          {/* Caption */}
          <p className="text-white text-sm leading-relaxed mb-3 max-w-xs">
            {video.caption}
          </p>

          {/* Music Info */}
          <div className="flex items-center">
            <Music className="w-4 h-4 text-white mr-2" />
            <p className="text-white text-xs opacity-80 flex-1 truncate">
              {video.music}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;