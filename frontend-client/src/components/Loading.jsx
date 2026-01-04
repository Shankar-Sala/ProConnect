import React from "react";

const Loading = ({ height = "100vh" }) => {
  return (
    <div
      style={{ height }}
      className="flex items-center justify-center"
    >
      <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
    </div>
  );
};

export default Loading;
