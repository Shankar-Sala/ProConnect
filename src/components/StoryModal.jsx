import {
  ArrowLeft,
  Sparkle,
  TextIcon,
  UploadIcon,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const StoryModal = ({ setShowModal, fetchStories }) => {
  const bgColors = [
    "#4f46e5",
    "#7c3aed",
    "#db2777",
    "#e11d48",
    "#ca8a04",
    "#0d9488",
  ];

  const [mode, setMode] = useState("text");
  const [background, setBackground] = useState(bgColors[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMode("media"); // IMPORTANT: set first
    setMedia(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleCreateStory = async () => {
    return new Promise((resolve) => setTimeout(resolve, 1500));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setShowModal(false)}>
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create a Story</h2>
          <span className="w-6" />
        </div>

        {/* Story Canvas */}
        <div
          className="relative rounded-lg h-96 overflow-hidden"
          style={{ backgroundColor: background }}
        >
          {mode === "text" && (
            <textarea
              className="absolute inset-0 bg-transparent text-white p-6 text-lg resize-none focus:outline-none"
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}

          {mode === "media" && previewUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              {media.type.startsWith("image") ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>
          )}
        </div>

        {/* Background colors */}
        <div className="flex gap-2 mt-4">
          {bgColors.map((color) => (
            <button
              key={color}
              className="w-6 h-6 rounded-full ring"
              style={{ backgroundColor: color }}
              onClick={() => setBackground(color)}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setMode("text");
              setMedia(null);
              setPreviewUrl(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded ${
              mode === "text" ? "bg-white text-black" : "bg-zinc-800"
            }`}
          >
            <TextIcon size={18} /> Text
          </button>

          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "media" ? "bg-white text-black" : "bg-zinc-800"
            }`}
          >
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              className="hidden"
            />
            <UploadIcon size={18} /> Photo/Video
          </label>
        </div>

        {/* Submit */}
        <button onClick={() => toast.promise(handleCreateStory(),{
            loading : 'saving...',
            success : <p>Story Added</p>,
            error : e => <p>e.message</p>,
        })}
          className="mt-4 w-full py-3 rounded bg-gradient-to-r from-indigo-500 to-purple-600 active:scale-95"
        >
          <Sparkle size={18} className="inline mr-2" />
          Create Story
        </button>
      </div>
    </div>
  );
};

export default StoryModal;
