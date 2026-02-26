import React from "react";
import { Outlet } from "react-router-dom";
import TopBar from "./TopBar.jsx";
import BottomNav from "./BottomNav.jsx";

export default function AdminLayout() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#07040F] text-white flex flex-col">
      <TopBar />
      <main className="flex-1 px-4 pb-24 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
