import React from "react";
import { Home, Calendar, Users, ShoppingCart, FlaskConical } from "lucide-react";

export default function Sidebar() {
  const sidebarItems = [
    { icon: <Home size={20} />, label: "Dashboard" },
    { icon: <Calendar size={20} />, label: "Schedule" },
    { icon: <Users size={20} />, label: "Patients", active: true },
    { icon: <ShoppingCart size={20} />, label: "Orders" },
    { icon: <FlaskConical size={20} />, label: "Laboratory" },
  ];

  return (
    <div
      className="w-[208px] flex flex-col justify-between rounded-r-3xl text-white shadow-lg"
      style={{ backgroundColor: "#00A646" }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center p-4">
        <img
          src="/icon/logo2.png"
          alt="Healthy Logo"
          className="rounded-lg mb-6"
          style={{ width: "209px", height: "210px" }}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2">
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer font-medium transition-all ${
              item.active ? "shadow" : "hover:bg-[#00923F]"
            }`}
            style={{
              backgroundColor: item.active ? "#874C96" : "transparent",
              color: "white",
            }}
          >
            {item.icon}
            <span className="truncate text-sm">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Profile */}
      <div className="p-4 border-t border-[#00923F]">
        <div className="flex flex-col items-center text-center">
          <img
            src="/icon/Amily.jpg"
            alt="Amily"
            className="w-12 h-12 rounded-full object-cover mb-2"
          />
          <div className="text-sm font-semibold">Amily</div>
          <div className="text-[11px] text-green-100">
            Amily@Healthypeople.com
          </div>
        </div>
      </div>
    </div>
  );
}
