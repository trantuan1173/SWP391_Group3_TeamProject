import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DoctorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
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
        navigate("/login");
        return;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id || payload.userId || payload.sub;
      setCurrentUserId(userId); // <-- Sẽ không lỗi nếu bạn khai báo đúng useState

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
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại!");
      }
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
      if (error.response?.status !== 404) {
        throw error;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-500">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Lịch làm việc của tôi</h1>
      
      {doctorInfo && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold">
            Bác sĩ: {doctorInfo.Employee?.name || 'N/A'}
          </h2>
          <p className="text-gray-600">
            Chuyên khoa: {doctorInfo.speciality || 'N/A'}
          </p>
          <p className="text-sm text-gray-500">
            Trạng thái: {doctorInfo.isAvailable ? 'Đang làm việc' : 'Không làm việc'}
          </p>
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">Chưa có lịch làm việc nào</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">
                    📅 {new Date(schedule.date).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-600 mt-2">
                    🕐 {schedule.startTime} - {schedule.endTime}
                  </p>
                  {schedule.Room && (
                    <p className="text-gray-600">
                      🏥 Phòng: {schedule.Room.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
