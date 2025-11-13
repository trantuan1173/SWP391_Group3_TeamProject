import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { jwtDecode } from "jwt-decode";
import { fetchUserById } from "@/api/userApi";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("✅ Token decoded successfully:", decoded);
        setUserIdser(decoded.id);
      } catch (err) {
        console.error("❌ Token decode error:", err);
        localStorage.removeItem("token");
      }
    }
  }, [token]);

  useEffect(() => {
    try {
      const userInfo = fetchUserById(userId.id);
      setUser(userInfo);
    } catch (err) {
      console.error("❌ Token decode error:", err);
      localStorage.removeItem("token");
    }
  });

  // Ẩn dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="w-full bg-white shadow-sm">
      <div
        className="flex items-center justify-between px-6"
        style={{
          height: "75px",
          width: "80%",
          margin: "0 auto",
          maxWidth: "80%",
        }}
      >
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src="/icon/logo.png" alt="Logo" className="h-[50px] w-auto" />
        </div>
        <nav className="flex items-center gap-[50px]">
          <a
            href="/doctor"
            className="text-black font-medium no-underline mx-[25px]"
          >
            Bác Sĩ
          </a>
          <a
            href="/book"
            className="text-black font-medium no-underline mx-[25px]"
          >
            Đặt lịch khám
          </a>
          <a
            href="/contact"
            className="text-black font-medium no-underline mx-[25px]"
          >
            Liên hệ
          </a>
          <a
            href="/news"
            className="text-black font-medium no-underline mx-[25px]"
          >
            Blog
          </a>
          <a
            href="/faq"
            className="text-black font-medium no-underline mx-[25px]"
          >
            FAQ
          </a>
          <a
            href="/policies"
            className="text-black font-medium no-underline mx-[25px]"
          >
            Chính sách
          </a>
        </nav>

        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          {token && user ? (
            <>
              <div
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => setOpen((prev) => !prev)}
              >
                <Avatar className="w-10 h-10 border border-gray-300">
                  <AvatarImage
                    src={
                      user?.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${
                        user?.name || "User"
                      }`
                    }
                    alt="User Avatar"
                  />
                  <AvatarFallback>
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-gray-700">
                  {user?.name || user?.email || "Người dùng"}
                </span>
              </div>
              {open && (
                <div
                  className="absolute right-0 top-[60px] bg-white shadow-lg rounded-lg z-50 w-[160px] border border-gray-100 animate-fadeIn"
                  onMouseEnter={() => setOpen(true)}
                  onMouseLeave={() => setOpen(false)}
                >
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate(`/patient/${user?.id || ""}/profile`);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Hồ sơ
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <button
                className="bg-green-900 text-white rounded-full px-6 py-2 font-bold text-sm hover:bg-green-800 transition"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </button>
              <button
                className="bg-red-700 text-white rounded-full px-6 py-2 font-bold text-sm hover:bg-red-800 transition"
                onClick={() => navigate("/register")}
              >
                Đăng kí
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
