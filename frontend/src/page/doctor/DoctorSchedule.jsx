import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from "../../components/doctor/DoctorDashboard";

const DoctorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeMenu, setActiveMenu] = useState('schedule');

  // State cho year và week selector
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  
  const navigate = useNavigate();

  // Hàm lấy tuần hiện tại
  function getCurrentWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  }

  // Hàm tạo danh sách các tuần trong năm
  const getWeeksInYear = (year) => {
    const weeks = [];
    const date = new Date(year, 0, 1);
    let weekNum = 1;
    
    while (date.getFullYear() === year) {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Monday
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
      
      if (startOfWeek.getFullYear() === year || endOfWeek.getFullYear() === year) {
        weeks.push({
          weekNum,
          label: `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} To ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`,
          startDate: new Date(startOfWeek),
          endDate: new Date(endOfWeek)
        });
      }
      
      date.setDate(date.getDate() + 7);
      weekNum++;
    }
    
    return weeks;
  };

  // Tạo danh sách năm (từ 2020 đến 2030)
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);
  const weeks = getWeeksInYear(selectedYear);

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

  // Hàm nhóm schedules theo tuần đã chọn
  const getWeeklySchedules = () => {
    const selectedWeekData = weeks.find(w => w.weekNum === selectedWeek);
    
    if (!selectedWeekData) {
      return { weekDays: [], groupedSchedules: {} };
    }

    const startOfWeek = selectedWeekData.startDate;
    const weekDays = [];
    const groupedSchedules = {};

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayKey = day.toISOString().split('T')[0];
      
      weekDays.push({
        date: day,
        key: dayKey,
        label: day.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })
      });
      
      groupedSchedules[dayKey] = schedules.filter(s => {
        const scheduleDate = new Date(s.date).toISOString().split('T')[0];
        return scheduleDate === dayKey;
      });
    }

    return { weekDays, groupedSchedules };
  };

  const { weekDays, groupedSchedules } = getWeeklySchedules();

  // Handler cho việc thay đổi năm
  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setSelectedYear(newYear);
    setSelectedWeek(1); // Reset về tuần 1 khi đổi năm
  };

  // Handler cho việc thay đổi tuần
  const handleWeekChange = (e) => {
    setSelectedWeek(parseInt(e.target.value));
  };


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
          </div>
           {/* Year Selector */}
              <div className="flex items-center gap-2 h-[50px]">
                <label className="text-sm font-medium text-gray-600 bg-blue-50 px-3 py-1 rounded" style={{ height:'40px', justifyContent: 'center', alignContent: 'center'}}>
                  YEAR
                </label>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white h-[40px]"
                  style={{ border: "20px" }}
                >
                  {years.map(year => (
                    <option key={year} value={year} >{year}</option>
                  ))}
                </select>
              </div>

              {/* Week Selector */}
              <div className="flex items-center gap-2 h-[50px]">
                <label className="text-sm font-medium text-gray-600 bg-blue-50 px-3 py-1 rounded" style={{ height:'40px', justifyContent: 'center', alignContent: 'center'}}>
                  WEEK
                </label>
                <select
                  value={selectedWeek}
                  onChange={handleWeekChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white min-w-[120px] h-[40px]"
                  style={{ border: "20px" }}
                >
                  {weeks.map(week => (
                    <option key={week.weekNum} value={week.weekNum} >
                      {week.label}
                    </option>
                  ))}
                </select>
              </div>

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

          
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorSchedule;
