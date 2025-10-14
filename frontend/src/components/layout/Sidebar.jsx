import React, { useEffect, useState } from "react";
import { Home, Calendar, Users, ShoppingCart, FlaskConical, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ patient }) {
  const sidebarItems = [
    { icon: <Home size={20} />, label: "Patients page", key: "patients" },
    { icon: <Users size={20} />, label: "Doctor List", key: "doctors" },
  ];

  // Lấy thông tin user từ patient (nếu có)
  const patientUser = patient?.user || {};
  const name = patientUser.name || patient?.name || "Tên bệnh nhân";
  const email = patientUser.email || patient?.email || "Email";
  const avatar = patientUser.avatar;
  const address = patientUser.address || patient?.address || "Chưa có địa chỉ";

  const [collapsed, setCollapsed] = useState(false);
  const [activeKey, setActiveKey] = useState(() => {
    try {
      return localStorage.getItem("sidebar-active") || "patients";
    } catch (e) {
      return "patients";
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed");
      setCollapsed(saved === "true");
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("sidebar-active", activeKey);
      localStorage.setItem("sidebar-collapsed", collapsed ? "true" : "false");
    } catch (e) {}
  }, [activeKey, collapsed]);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`flex flex-col justify-between text-white shadow-lg transition-all duration-200 ${
        collapsed ? "w-16" : "w-[208px]"
      } rounded-r-3xl overflow-hidden`}
      style={{ backgroundColor: "#00A646" }}
    >
      {/* Top: logo + toggle */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <img
            src="/icon/logo2.png"
            alt="Healthy Logo"
            className={`rounded-lg transition-all ${collapsed ? "w-10 h-10" : "w-20 h-20"}`}
          />
          {!collapsed && <div className="text-white font-semibold">Healthy</div>}
        </div>

        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((c) => !c)}
          className="p-2 rounded-full hover:bg-white/10"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <div
              key={item.key}
              role="button"
              tabIndex={0}
              title={item.label}
                onClick={() => {
                  setActiveKey(item.key);
                  // Map keys to routes (special-case 'appointment' depending on auth)
                  if (item.key === 'patients') {
                    if (user && user.id) return navigate(`/patient/${user.id}`);
                    return navigate('/patient');
                  }
                  if (item.key === 'doctors') return navigate('/patient/doctors');
                  // Fallback: navigate to key as path
                  return navigate(`/${item.key}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setActiveKey(item.key);
                  }
                }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all select-none ${
                isActive ? "bg-white/10 shadow-inner" : "hover:bg-white/5"
              }`}
              style={{ color: "white" }}
            >
              <div className={`flex items-center justify-center ${collapsed ? "w-full" : "w-6"}`}>
                {item.icon}
              </div>
              {!collapsed && <span className="truncate text-sm">{item.label}</span>}
              {isActive && !collapsed && <span className="ml-auto text-xs px-2 py-1 bg-white/10 rounded">Active</span>}
            </div>
          );
        })}
      </nav>

      {/* Profile (no avatar) */}
      <div className="p-3 border-t border-[#00923F]">
        {!collapsed && (
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{name}</div>
                <div className="text-[11px] text-green-100">{email}</div>
              </div>
              {/* profile actions moved to PatientInfo */}
            </div>
          </div>
        )}
        {!collapsed && (
          <div className="mt-1">
            <button onClick={handleLogout} className="w-full text-sm py-2 rounded-full bg-white text-green-700 hover:bg-white/90">Log out</button>
          </div>
        )}
      </div>
    </aside>
  );
}
