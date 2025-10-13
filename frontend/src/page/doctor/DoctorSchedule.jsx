import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DoctorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeMenu, setActiveMenu] = useState('schedule');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id || payload.userId || payload.sub;
      setCurrentUserId(userId);

      if (!userId) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `http://localhost:1118/api/employees/${userId}/with-role`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.data.isDoctor) {
        alert("Bạn không có quyền truy cập trang này");
        navigate("/");
        return;
      }

      setDoctorInfo(response.data);
      await fetchSchedules(userId, token);
    } catch (error) {
      console.error("Auth check error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async (doctorId, token) => {
    try {
      const response = await axios.get(
        `http://localhost:1118/api/doctor-schedules/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSchedules(response.data);
    } catch (error) {
      console.error("Fetch schedules error:", error.response?.data || error.message);
      setError("Không thể tải lịch làm việc.");
    }
  };

  // Hàm nhóm schedules theo ngày trong tuần hiện tại
  const getWeeklySchedules = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Monday
    const weekDays = [];
    const groupedSchedules = {};

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayKey = day.toISOString().split('T')[0];
      weekDays.push({
        date: day,
        key: dayKey,
        label: day.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' })
      });
      groupedSchedules[dayKey] = schedules.filter(s => {
        const scheduleDate = new Date(s.date).toISOString().split('T')[0];
        return scheduleDate === dayKey;
      });
    }

    return { weekDays, groupedSchedules };
  };

  const { weekDays, groupedSchedules } = getWeeklySchedules();

  if (loading) {
    return (
      <DoctorLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu} doctorInfo={doctorInfo}>
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">Đang tải...</div>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu} doctorInfo={doctorInfo}>
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-red-500">Lỗi: {error}</div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu} doctorInfo={doctorInfo}>
      {/* Main content */}
      <div className="p-6">
        {/* Top small bar (trắng) */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 rounded hover:bg-white/60"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <div className="text-gray-700 font-semibold">Xin chào, {doctorInfo?.name || 'Bác Sĩ'}</div>
          </div>
          <div className="text-sm text-gray-500">Hôm nay: {new Date().toLocaleDateString('vi-VN')}</div>
        </div>

        {/* White card giống ảnh: title, search, create button, content */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Lịch Làm Việc</h1>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search by name or date..."
                className="px-4 py-2 border rounded-lg w-80 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                onChange={() => {}}
              />
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow"
                onClick={() => alert('Tạo lịch mới')}
              >
                Create Schedule
              </button>
            </div>
          </div>

          {/* table header similar to image (but we display weekly grid below) */}
          <div className="mb-4 text-sm text-gray-500">Your Schedule / Tuần hiện tại</div>

          {/* Weekly grid */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-7 gap-3 mb-3">
              {weekDays.map(day => (
                <div key={day.key} className="text-center font-medium text-gray-700">
                  {day.label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3">
              {weekDays.map(day => (
                <div key={day.key} className="min-h-[120px] bg-white rounded-lg p-3 border border-gray-100">
                  {groupedSchedules[day.key] && groupedSchedules[day.key].length > 0 ? (
                    groupedSchedules[day.key].map((s) => (
                      <div key={s.id || `${day.key}-${Math.random()}`} className="mb-2 p-2 rounded-md bg-green-50 border border-green-100 text-sm">
                        <div className="font-semibold text-sm">{s.title || 'Lịch khám'}</div>
                        <div className="text-xs text-gray-600">🕒 {s.startTime || s.from || s.start} - {s.endTime || s.to || s.end}</div>
                        <div className="text-xs text-gray-500 mt-1">{s.note || ''}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">Không có lịch</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pagination area similar to image */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button className="text-sm text-blue-600 hover:underline">‹ Previous</button>
            <div className="px-3 py-1 border rounded-md bg-white text-sm">1</div>
            <button className="text-sm text-blue-600 hover:underline">Next ›</button>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorSchedule;
