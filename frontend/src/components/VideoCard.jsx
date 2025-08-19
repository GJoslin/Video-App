import React from "react";

function VideoCard({ video }) {
  return (
    <div className="relative h-full w-full flex flex-col justify-end pb-16 px-4">
      <video
        src={video.url}
        className="h-full w-full object-cover"
        autoPlay
        loop
        muted
      />
      <div className="absolute bottom-4 left-4 text-white">
        <p className="text-lg font-bold">@{video.username}</p>
        <p className="text-sm mt-1">{video.caption}</p>
        <div className="flex mt-2 space-x-4">
          <span className="text-sm">{video.likes} ❤️</span>
          <span className="text-sm">{video.comments} 💬</span>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
