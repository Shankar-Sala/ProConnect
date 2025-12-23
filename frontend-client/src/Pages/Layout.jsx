import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { dummyUserData } from "../assets/assets";
import Loading from "../components/Loading";

const Layout = () => {
  const user = dummyUserData;
  const [sidebarOpen, setSidebarOpen] = useState(false); // ✅ Declare before return

  if (!user) return <Loading />;

  return (
    <div className="w-full flex h-screen">
      {/* Sidebar */}
      <Sidebar SidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 bg-slate-50">
        <Outlet />
      </div>

      {/* Sidebar toggle button (mobile only) */}
      <div className="absolute top-3 right-3 sm:hidden">
        {sidebarOpen ? (
          <X
            className="p-2 z-[100] bg-white rounded-md shadow w-10 h-10 text-gray-600"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        ) : (
          <Menu
            className="p-2 z-[100] bg-white rounded-md shadow w-10 h-10 text-gray-600"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          />
        )}
      </div>
    </div>
  );
};

export default Layout;
