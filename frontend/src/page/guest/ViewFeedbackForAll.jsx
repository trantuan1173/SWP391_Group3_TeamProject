import React, { useEffect, useState } from "react";
import Header from "../../components/guestlayout/Header";
import Footer from "../../components/guestlayout/Footer";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config";

const FEEDBACKS_PER_PAGE = 5;

export default function ViewFeedbackForAll() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  // Lấy thông tin bác sĩ
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doctorUrl = API_ENDPOINTS.GET_DOCTOR_BY_ID(id);
        const res = await axios.get(doctorUrl);
        setDoctor(res.data);
      } catch (err) {
        setDoctor(null);
      }
    };
    fetchDoctor();
  }, [id]);

  // Lấy feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const feedbackUrl = API_ENDPOINTS.GET_DOCTOR_FEEDBACKS(id);
        const res = await axios.get(feedbackUrl);
        const list = Array.isArray(res.data.data) ? res.data.data : [];
        setFeedbacks(list);
      } catch (err) {
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [id]);

  // Phân trang
  const totalPages = Math.ceil(feedbacks.length / FEEDBACKS_PER_PAGE);
  const paginatedFeedbacks = feedbacks.slice(
    (page - 1) * FEEDBACKS_PER_PAGE,
    page * FEEDBACKS_PER_PAGE
  );

  function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}


  return (
    <>
      <Header />
      <div className="bg-[#f6fff4] min-h-screen pt-12 pb-10">
        <div className="w-[70%] mx-auto">
          {/* Nút quay lại, căn trái, cách biệt */}
          <div className="mb-8 flex">
            <button
              onClick={() => navigate("/doctor")}
              className="bg-green-700 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-green-800 transition"
              style={{ marginRight: "auto" }}
            >
              ← Quay lại danh sách bác sĩ
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h4 className="text-2xl font-bold mb-6 text-green-800">
              Đánh giá của bệnh nhân với bác sĩ
              {doctor?.name ? ` ${doctor.name}` : ` #${id}`}
            </h4>
            {loading ? (
              <div className="text-gray-600">Đang tải đánh giá...</div>
            ) : feedbacks.length > 0 ? (
              <>
                <div className="space-y-6">
                  {paginatedFeedbacks.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="border border-gray-200 rounded-lg p-5 bg-[#f9f9f9] hover:shadow-md transition"
                    >
              
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold text-lg">
                            {feedback.Patient?.name?.[0]?.toUpperCase() || "A"}
                            </div>
                            <div className="font-semibold text-base text-green-900">
                            {feedback.Patient?.name || "Ẩn danh"}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                            {/* Hiển thị sao */}
                            {Array.from({ length: 5 }).map((_, i) => (
                            <span
                                key={i}
                                style={{
                                color: i < Math.round(feedback.rating) ? "#01875F" : "#d1d5db", 
                                fontSize: "20px"
                                }}
                            >
                                ★
                            </span>
                            ))}
                            {/* Hiển thị ngày tạo */}
                            <span className="ml-2" style={{ color: "#222", fontWeight: "500" }}>
                            {formatDate(feedback.createdAt)}
                            </span>
                        </div>
                        
                        <div className="text-gray-700 mb-2">{feedback.content}</div>

                    </div>
                  ))}
                </div>
                {/* Phân trang */}
                <div className="flex justify-center items-center mt-8 gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      page === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-green-700 text-white hover:bg-green-800"
                    } transition`}
                  >
                    ← Trước
                  </button>
                  <span className="mx-3 font-bold text-green-900">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => setPage(page + 1)}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      page === totalPages || totalPages === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-green-700 text-white hover:bg-green-800"
                    } transition`}
                  >
                    Sau →
                  </button>
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Chưa có đánh giá nào cho bác sĩ này.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
