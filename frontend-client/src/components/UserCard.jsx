import React from "react";
import { MapPin, MessageCircle, Plus, UserPlus } from "lucide-react";
import { useSelector } from "react-redux";

const UserCard = ({ user }) => {
  const currentUser = useSelector((state) => state.user.value);

  const handleFollow = async () => {};
  const handleConnectionsRequest = async () => {};

  const isFollowing =
    (currentUser?.following ?? []).includes(user?._id);

  const isConnected =
    (currentUser?.connections ?? []).includes(user?._id);

  const followersCount = user?.followers?.length ?? 0;

  return (
    <div className="p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md">
      <div className="text-center">
        <img
          src={user?.profile_picture}
          alt=""
          className="rounded-full w-16 shadow-md mx-auto"
        />
        <p className="mt-4 font-semibold">{user?.full_name}</p>

        {user?.username && (
          <p className="text-gray-500 font-light">@{user.username}</p>
        )}

        {user?.bio && (
          <p className="text-gray-600 mt-2 text-center text-sm px-4">
            {user.bio}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
          <MapPin className="w-4 h-4" />
          {user?.location || "Unknown"}
        </div>

        <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
          <span>{followersCount}</span> Followers
        </div>
      </div>

      <div className="flex mt-4 gap-2">
        {/* Follow button */}
        <button
          onClick={handleFollow}
          disabled={isFollowing}
          className="w-full py-2 rounded-md flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer disabled:opacity-70"
        >
          <UserPlus className="w-4 h-4" />
          {isFollowing ? "Following" : "Follow"}
        </button>

        {/* Connection / Message button */}
        <button
          onClick={handleConnectionsRequest}
          className="flex items-center justify-center w-16 border text-slate-500 group rounded-md cursor-pointer active:scale-95 transition"
        >
          {isConnected ? (
            <MessageCircle className="w-5 h-5 group-hover:scale-105 transition" />
          ) : (
            <Plus className="w-5 h-5 group-hover:scale-105 transition" />
          )}
        </button>
      </div>
    </div>
  );
};
export default UserCard;
