import React, { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";

import Login from "./Pages/Login";
import Feed from "./Pages/Feed";
import Messages from "./Pages/Messages";
import ChatBox from "./Pages/ChatBox";
import Connections from "./Pages/Connections";
import Discover from "./Pages/Discover";
import Profile from "./Pages/Profile";
import CreatePost from "./Pages/CreatePost";
import Layout from "./Pages/Layout";
import Loading from "./components/Loading";

const App = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (user) {
      getToken().then((token) => console.log(token));
    }
  }, [user]);

  if (!isLoaded) return <Loading />;

  return (
    <>
      <Toaster />
      <Routes>
        {/* Public route */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />

        {/* Protected routes */}
        {user && (
          <Route path="/" element={<Layout />}>
            <Route index element={<Feed />} />
            <Route path="messages" element={<Messages />} />
            <Route path="messages/:userId" element={<ChatBox />} />
            <Route path="connections" element={<Connections />} />
            <Route path="discover" element={<Discover />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:profileId" element={<Profile />} />
            <Route path="create-post" element={<CreatePost />} />
            <Route
              path="*"
              element={<div className="text-center mt-10">Page Not Found</div>}
            />
          </Route>
        )}

        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>
    </>
  );
};

export default App;
