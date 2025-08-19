import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Music, Plus } from 'lucide-react';
import { videos as videoAPI, users as userAPI, utils } from '../services/api';

function VideoCard({ video, isActive, onUpdateVideo }) {
  const videoRef = useRef(null);
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(video.isBookmarked);
  const [isFollowing, setIsFollowing] = useState(video.isFollowing);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [bookmarkCount, setBookmarkCount] = useState(video.bookmarks);
  const [shareCount, setShareCount] = useState(video.shares);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleLike = async () => {
    if (!utils.isAuthenticated()) {
      alert('Please log in to like videos');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await videoAPI.like(video.id);
      
      setIsLiked(response.isLiked);
      setLikeCount(response.likes);
      
      // Update parent component
      onUpdateVideo(video.id, {
        isLiked: response.isLiked,
        likes: response.likes
      });
    } catch (error) {
      console.error('Error liking video:', error);
      alert('Failed to like video');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!utils.isAuthenticated()) {
      alert('Please log in to bookmark videos');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await videoAPI.bookmark(video.id);
      
      setIsBookmarked(response.isBookmarked);
      setBookmarkCount(response.bookmarks);
      
      // Update parent component
      onUpdateVideo(video.id, {
        isBookmarked: response.isBookmarked,
        bookmarks: response.bookmarks
      });
    } catch (error) {
      console.error('Error bookmarking video:', error);
      alert('Failed to bookmark video');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(window.location.origin + `/video/${video.id}`);
      
      // Update share count in backend
      if (utils.isAuthenticated()) {
        const response = await videoAPI.share(video.id);
        setShareCount(response.shares);
        
        onUpdateVideo(video.id, {
          shares: response.shares
        });
      }
      
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing video:', error);
      alert('Failed to share video');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!utils.isAuthenticated()) {
      alert('Please log in to follow users');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      // Get user ID from video data (you might need to add this to your video response)
      const response = await userAPI.follow(video.uploadedBy || video.userId);
      
      setIsFollowing(response.isFollowing);
      
      onUpdateVideo(video.id, {
        isFollowing: response.isFollowing
      });
    } catch (error) {
      console.error('Error following user:', error);
      alert('Failed to follow user');
    } finally {
      setLoading(false);
    }
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

  const handleCommentClick = () => {
    // You can implement a comment modal here
    alert('Comments feature coming soon!');
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
        onError={(e) => {
          console.error('Video load error:', e);
        }}
      />

      {/* Play/Pause Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[12px] border-y-transparent ml-1"></div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-40">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-20 flex flex-col items-center space-y-6">
        {/* Profile Picture + Follow Button */}
        <div className="relative">
          <img
            src={video.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"}
            alt={video.username}
            className="w-12 h-12 rounded-full border-2 border-white object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face";
            }}
          />
          {!isFollowing && utils.isAuthenticated() && (
            <button
              onClick={handleFollow}
              disabled={loading}
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Like Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleLike}
            disabled={loading}
            className={`p-3 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 ${
              isLiked ? 'bg-red-500' : 'bg-black bg-opacity-20 hover:bg-opacity-40'
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
          <button 
            onClick={handleCommentClick}
            className="p-3 bg-black bg-opacity-20 rounded-full hover:bg-opacity-40 transition-all duration-200 hover:scale-110"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-xs mt-1 font-semibold">
            {formatCount(video.comments)}
          </span>
        </div>

        {/* Bookmark Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleBookmark}
            disabled={loading}
            className={`p-3 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 ${
              isBookmarked ? 'bg-yellow-500' : 'bg-black bg-opacity-20 hover:bg-opacity-40'
            }`}
          >
            <Bookmark 
              className={`w-6 h-6 ${isBookmarked ? 'text-white fill-current' : 'text-white'}`}
            />
          </button>
          <span className="text-white text-xs mt-1 font-semibold">
            {formatCount(bookmarkCount)}
          </span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <button 
            onClick={handleShare}
            disabled={loading}
            className="p-3 bg-black bg-opacity-20 rounded-full hover:bg-opacity-40 transition-all duration-200 hover:scale-110 disabled:opacity-50"
          >
            <Share className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-xs mt-1 font-semibold">
            {formatCount(shareCount)}
          </span>
        </div>

        {/* More Options */}
        <button className="p-3 bg-black bg-opacity-20 rounded-full hover:bg-opacity-40 transition-all duration-200 hover:scale-110">
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
            {!isFollowing && utils.isAuthenticated() && (
              <button
                onClick={handleFollow}
                disabled={loading}
                className="ml-3 px-4 py-1 border border-white text-white text-sm font-semibold rounded hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Following...' : 'Follow'}
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
              {video.music || "Original Sound"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;