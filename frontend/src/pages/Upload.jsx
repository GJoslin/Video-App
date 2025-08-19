import { useState } from "react";
import axios from "axios";

function Upload() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return setMessage("Please select a video file.");

    const formData = new FormData();
    formData.append("video", file);
    formData.append("caption", caption);

    try {
      setUploading(true);
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Upload successful!");
      setFile(null);
      setCaption("");
    } catch (err) {
      console.error(err);
      setMessage("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-96 text-center">
        <h2 className="text-2xl mb-4 font-bold">Upload Video</h2>

        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-3"
        />

        {file && (
          <video
            src={URL.createObjectURL(file)}
            controls
            className="w-full rounded-lg mb-3"
          />
        )}

        <input
          type="text"
          placeholder="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
        />

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-red-500 p-2 rounded"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {message && <p className="mt-2">{message}</p>}
      </div>
    </div>
  );
}

export default Upload;
