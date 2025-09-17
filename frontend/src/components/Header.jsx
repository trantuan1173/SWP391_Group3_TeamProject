import React from "react";

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm">
      <div
        className="flex items-center justify-between px-6"
        style={{ height: "75px", width: "80%", margin: "0 auto", maxWidth: "80%" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/icon/logo.png"
            alt="Logo"
            className="h-[50px] w-auto"
          />
        </div>
        {/* Menu */}
        <nav className="flex items-center" style={{ gap: "50px" }}>
          <a href="#" className="text-black font-medium no-underline">Bác Sĩ</a>
          <a href="#" className="text-black font-medium no-underline">Đặt lịch khám</a>
          <button className="border border-gray-300 rounded px-3 py-1 text-gray-700 bg-gray-100 hover:bg-gray-200 transition text-sm font-medium">
            Blog
          </button>
        </nav>
        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <button className="bg-green-900 text-white rounded-full px-6 py-2 font-bold text-sm hover:bg-green-800 transition"
            style={{ borderRadius: "999px" }}>
            Log-In
          </button>
          <button className="bg-red-700 text-white rounded-full px-6 py-2 font-bold text-sm hover:bg-red-800 transition"
            style={{ borderRadius: "999px" }}>
            Sign-Up
          </button>
        </div>
      </div>
    </header>
  );
}