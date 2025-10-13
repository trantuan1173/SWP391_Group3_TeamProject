import React from "react";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard({ children, activeMenu, setActiveMenu, doctorInfo }) {
  const navigate = useNavigate();
  
  const avatarUrl = doctorInfo?.avatar || doctorInfo?.image || doctorInfo?.profileImage;
  const doctorName = doctorInfo?.name || doctorInfo?.fullName || 'Admin';
  const firstLetter = doctorName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-72 bg-green-600 text-white flex flex-col justify-between rounded-tr-xl rounded-br-xl shadow-lg">
        <div>
          <div className="p-6">
            {/* Logo */}
            <div className="w-full flex items-center justify-center mb-6">
              <div className="flex items-center gap-2">
                <img
                  src="/icon/logo.png"
                  alt="Logo"
                  className="h-[50px] w-auto"
                />
              </div>
            </div>

            {/* Tiêu đề Dashboard */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            </div>

            <nav className="mt-2 space-y-3">
              <button
                onClick={() => setActiveMenu('schedule')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition ${
                  activeMenu === 'schedule' 
                    ? 'bg-white text-green-600 font-semibold' 
                    : 'text-white hover:bg-green-500/30'
                }`}
                style={{ borderRadius: "20px", marginBottom: "10px" }}
              >
                <span className="text-lg">🗓️</span>
                <span>Schedule</span>
              </button>
              <button
                onClick={() => setActiveMenu('patients')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition ${
                  activeMenu === 'patients' 
                    ? 'bg-white text-green-600 font-semibold' 
                    : 'text-white hover:bg-green-500/30'
                }`}
                style={{ borderRadius: "20px", marginBottom: "10px" }}
              >
                <span className="text-lg">🧑‍⚕️</span>
                <span>Patients</span>
              </button>
              <button
                onClick={() => setActiveMenu('settings')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition ${
                  activeMenu === 'settings' 
                    ? 'bg-white text-green-600 font-semibold' 
                    : 'text-white hover:bg-green-500/30'
                }`}
                style={{ borderRadius: "20px", marginBottom: "10px" }}
              >
                <span className="text-lg">⚙️</span>
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-green-500/40">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Avatar bác sĩ */}
              {/* Avatar bác sĩ */}
<div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center font-semibold overflow-hidden">
  {avatarUrl ? (
    <img
      src={avatarUrl}
      alt={doctorName}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.parentElement.textContent = firstLetter;
      }}
    />
  ) : (
    firstLetter
  )}
</div>

              <div>
                <div className="text-sm font-semibold">{doctorName}</div>
                <div className="text-xs opacity-80">Bác sĩ</div>
              </div>
            </div>
            <button
              onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow transition"
              style={{ borderRadius: "20px", marginBottom: "10px" }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content slot */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
