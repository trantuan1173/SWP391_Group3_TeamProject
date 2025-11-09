import React, { useEffect, useState } from "react";
import axios from "axios";
import DoctorDashboard from "../../components/doctor/DoctorDashboard";
import { API_ENDPOINTS } from "../../config";

const ViewFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Giả sử bạn đã lưu doctorId trong token hoặc lấy từ API
      const payload = JSON.parse(atob(token.split('.')[1]));
      const doctorId = payload.id || payload.userId || payload.sub;
      console.log("Token payload:", payload);
        console.log("doctorId gửi lên API:", doctorId);

      setDoctorInfo(payload); 

      const res = await axios.get(
        API_ENDPOINTS.GET_DOCTOR_FEEDBACKS(doctorId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedbacks(res.data.data || []);
      console.log("Feedbacks sau khi set:", res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Có lỗi xảy ra");
      console.error("Lỗi khi gọi API feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DoctorDashboard doctorInfo={doctorInfo}>
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow mt-8">
        <h1 className="text-2xl font-bold mb-6 text-green-700">Feedback của bệnh nhân</h1>
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-gray-500">Chưa có feedback nào.</div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map(fb => (
              <div key={fb.id} className="border rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg">{fb.Patient?.name || "Bệnh nhân"}</span>
                  <span className="text-yellow-500 font-bold">Đánh giá: {fb.rating}/5</span>
                </div>
                <p className="mb-2 text-gray-800">{fb.content}</p>
                <div className="text-sm text-gray-500">
                  Ngày gửi: {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DoctorDashboard>
  );
};

export default ViewFeedback;
