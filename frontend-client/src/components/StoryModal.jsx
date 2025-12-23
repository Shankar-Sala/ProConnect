import React, { useState, useEffect } from "react";
import { ArrowLeft, Sparkle, TextIcon, UploadIcon } from "lucide-react";
import toast from "react-hot-toast";

const StoryModal = ({ setShowModal, fetchStories }) => {
  const bgColors = ["#4f46e5", "#7c3aed", "#db2777", "#e11d48", "#ca8a04", "#0d9488"];

  const [mode, setMode] = useState("text");
  const [background, setBackground] = useState(bgColors[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file upload
  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMode("media");
    setMedia(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Simulate story creation (replace with API call)
  const handleCreateStory = async () => {
    if (!text && !media) {
      toast.error("Please add text or media to create a story");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate API
      toast.success("Story added!");
      setShowModal(false);
      fetchStories?.(); // refresh stories if function passed
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setShowModal(false)} aria-label="Close">
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create a Story</h2>
          <span className="w-6" />
        </div>

        {/* Story Canvas */}
        <div
          className="relative rounded-lg h-96 overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: background }}
        >
          {mode === "text" && (
            <textarea
              className="absolute inset-0 bg-transparent text-white p-6 text-lg resize-none overflow-auto focus:outline-none"
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}

          {mode === "media" && previewUrl && (
            <>
              {media.type.startsWith("image") ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <video
                  src={previewUrl}
                  autoPlay
                  muted
                  loop
                  controls
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </>
          )}
        </div>

        {/* Background Colors */}
        <div className="flex gap-2 mt-4">
          {bgColors.map((color) => (
            <button
              key={color}
              className="w-6 h-6 rounded-full ring cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => setBackground(color)}
              aria-label={`Set background color ${color}`}
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
              aria-label="Upload photo or video"
            />
            <UploadIcon size={18} /> Photo/Video
          </label>
        </div>

        {/* Submit */}
        <button
          onClick={handleCreateStory}
          disabled={loading || (!text && !media)}
          className={`mt-4 w-full py-3 rounded bg-gradient-to-r from-indigo-500 to-purple-600 active:scale-95 ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <Sparkle size={18} className="inline mr-2" />
          {loading ? "Saving..." : "Create Story"}
        </button>
      </div>
    </div>
  );
};

export default StoryModal;
