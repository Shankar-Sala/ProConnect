import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./Pages/Login.jsx";
import Feed from "./Pages/Feed.jsx";
import Messages from "./Pages/Messages.jsx";
import ChatBox from "./Pages/ChatBox.jsx";
import Connections from "./Pages/Connections.jsx";
import Discover from "./Pages/Discover.jsx";
import Profile from "./Pages/Profile.jsx";
import CreatePost from "./Pages/CreatePost.jsx";
import { useUser, useAuth } from "@clerk/clerk-react";
import Layout from "./Pages/Layout.jsx";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "./features/user/userSlice.js";

const App = () => {
  const { user } = useUser();

  //! api testing : http://localhost:4000/api/user/data
  // const {getToken} = useAuth();
  // useEffect(()=>{
  //   if(user){
  //      getToken().then((token)=> console.log("Token: ",token))
  //   }
  // },[user])

  //! we have to call function to get the user data
  const { getToken } = useAuth();

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken();
        dispatch(fetchUser(token));
      }
    };

    fetchData();
  }, [user, getToken, dispatch]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
