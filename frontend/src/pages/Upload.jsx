import React, { useState } from "react";
import { videos as videoAPI, utils } from "../services/api";
import { Upload as UploadIcon, X, Play, Pause } from "lucide-react";

function Upload() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [music, setMusic] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [previewUrl, setPreviewUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('video/')) {
        setMessage("Please select a valid video file");
        setMessageType("error");
        return;
      }

      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (selectedFile.size > maxSize) {
        setMessage("File size must be less than 50MB");
        setMessageType("error");
        return;
      }

      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setMessage("");
    }
  };

  const handleUpload = async () => {
    // Check authentication
    if (!utils.isAuthenticated()) {
      setMessage("Please log in to upload videos");
      setMessageType("error");
      return;
    }

    if (!file) {
      setMessage("Please select a video file");
      setMessageType("error");
      return;
    }

    if (!caption.trim()) {
      setMessage("Please add a caption");
      setMessageType("error");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("caption", caption.trim());
    formData.append("music", music.trim() || "Original Sound");

    try {
      setUploading(true);
      setMessage("Uploading your video...");
      setMessageType("info");

      const response = await videoAPI.upload(formData);

      setMessage("Video uploaded successfully! 🎉");
      setMessageType("success");
      
      // Reset form
      setFile(null);
      setCaption("");
      setMusic("");
      setPreviewUrl("");
      
      // Clear file input
      const fileInput = document.getElementById('video-upload');
      if (fileInput) fileInput.value = '';

      // Redirect to home after success
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.message || "Upload failed. Please try again.";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl("");
    setIsPlaying(false);
    const fileInput = document.getElementById('video-upload');
    if (fileInput) fileInput.value = '';
  };

  const togglePreview = () => {
    const video = document.getElementById('preview-video');
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl mb-6 text-center font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
          Upload Video
        </h2>

        {/* File Upload Area */}
        <div className="mb-6">
          {!file ? (
            <label 
              htmlFor="video-upload" 
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-xl cursor-pointer bg-gray-700 hover:bg-gray-650 transition-colors"
            >
              <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-300 text-center">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-gray-500 text-sm mt-2">MP4, MOV, AVI (Max 50MB)</p>
            </label>
          ) : (
            <div className="relative">
              <video
                id="preview-video"
                src={previewUrl}
                className="w-full h-48 object-cover rounded-xl"
                muted
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video Controls Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl flex items-center justify-center">
                <button
                  onClick={togglePreview}
                  className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-1" />
                  )}
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <p className="text-sm text-gray-400 mt-2 text-center">
                {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
              </p>
            </div>
          )}

          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Caption Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Caption *</label>
          <textarea
            placeholder="Write a caption... #hashtags"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-red-500 focus:outline-none resize-none"
          />
          <div className="text-xs text-gray-400 mt-1 text-right">
            {caption.length}/500
          </div>
        </div>

        {/* Music Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Music (Optional)</label>
          <input
            type="text"
            placeholder="Add music title or keep 'Original Sound'"
            value={music}
            onChange={(e) => setMusic(e.target.value)}
            maxLength={100}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-red-500 focus:outline-none"
          />
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading || !file || !caption.trim()}
          className={`w-full p-3 rounded-lg font-semibold transition-all ${
            uploading || !file || !caption.trim()
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transform hover:scale-105'
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Uploading...
            </div>
          ) : (
            'Post Video'
          )}
        </button>

        {/* Status Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-center text-sm ${
            messageType === 'success' 
              ? 'bg-green-600 text-white' 
              : messageType === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white'
          }`}>
            {message}
          </div>
        )}

        {/* Login Prompt for Non-authenticated Users */}
        {!utils.isAuthenticated() && (
          <div className="mt-4 p-3 bg-yellow-600 rounded-lg text-center text-sm">
            <p>Please <a href="/login" className="underline font-semibold">log in</a> to upload videos</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;