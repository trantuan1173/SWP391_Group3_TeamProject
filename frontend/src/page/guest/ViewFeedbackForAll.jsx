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
  const [sortBy, setSortBy] = useState("date-desc");

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

  // Tính toán thống kê
  const calculateStats = () => {
    if (feedbacks.length === 0) return { average: 0, distribution: {} };
    
    const total = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
    const average = (total / feedbacks.length).toFixed(1);
    
    const distribution = {
      5: feedbacks.filter(fb => fb.rating === 5).length,
      4: feedbacks.filter(fb => fb.rating === 4).length,
      3: feedbacks.filter(fb => fb.rating === 3).length,
      2: feedbacks.filter(fb => fb.rating === 2).length,
      1: feedbacks.filter(fb => fb.rating === 1).length,
    };
    
    return { average, distribution };
  };

  const { average, distribution } = calculateStats();

  // Hàm sắp xếp feedback
  const getSortedFeedbacks = () => {
    const sorted = [...feedbacks];
    
    switch(sortBy) {
      case "rating-desc":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "rating-asc":
        return sorted.sort((a, b) => a.rating - b.rating);
      case "date-desc":
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "date-asc":
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return sorted;
    }
  };

  const sortedFeedbacks = getSortedFeedbacks();

  // Phân trang
  const totalPages = Math.ceil(sortedFeedbacks.length / FEEDBACKS_PER_PAGE);
  const paginatedFeedbacks = sortedFeedbacks.slice(
    (page - 1) * FEEDBACKS_PER_PAGE,
    page * FEEDBACKS_PER_PAGE
  );

  // Hàm render sao
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 font-semibold text-gray-700">{rating}/5</span>
      </div>
    );
  };

  // Component thống kê rating
  const RatingStats = () => {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6 border border-green-200">
        <div className="flex items-start justify-between">
          {/* Điểm trung bình */}
          <div className="text-center pr-8 border-r border-gray-300">
            <div className="text-5xl font-bold text-green-600">{average}</div>
            <div className="flex justify-center my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-6 h-6 ${star <= Math.round(average) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <div className="text-sm text-gray-600">{feedbacks.length} đánh giá</div>
          </div>

          {/* Biểu đồ phân bố */}
          <div className="flex-1 pl-8">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = distribution[rating];
              const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 w-8">{rating}</span>
                  <svg className="w-4 h-4 text-yellow-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 mx-2">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="bg-[#f6fff4] min-h-screen pt-12 pb-10">
        <div className="w-[70%] mx-auto">
          {/* Nút quay lại */}
          <div className="mb-8 flex">
            <button
              onClick={() => navigate("/doctor")}
              className="bg-green-700 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-green-800 transition"
            >
              ← Quay lại danh sách bác sĩ
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Header với tiêu đề và bộ lọc */}
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-2xl font-bold text-green-800">
                Đánh giá của bệnh nhân với bác sĩ
                {doctor?.name ? ` ${doctor.name}` : ` #${id}`}
              </h4>

              {/* Bộ lọc sắp xếp */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Sắp xếp:</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1); // Reset về trang 1 khi thay đổi sắp xếp
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="date-desc">Mới nhất</option>
                  <option value="date-asc">Cũ nhất</option>
                  <option value="rating-desc">Đánh giá cao nhất</option>
                  <option value="rating-asc">Đánh giá thấp nhất</option>
                </select>
              </div>
            </div>

            {/* Thống kê rating */}
            {!loading && feedbacks.length > 0 && <RatingStats />}

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                <p className="mt-2 text-gray-600">Đang tải đánh giá...</p>
              </div>
            ) : feedbacks.length > 0 ? (
              <>
                <div className="space-y-4">
                  {paginatedFeedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="border border-gray-200 rounded-lg p-5 bg-gradient-to-r from-blue-50 to-green-50 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                            {fb.Patient?.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <span className="font-semibold text-lg text-gray-800">
                              {fb.Patient?.name || "Bệnh nhân"}
                            </span>
                            <div className="text-xs text-gray-500">
                              {new Date(fb.createdAt).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>
                        {renderStars(fb.rating)}
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 mt-3">
                        <p className="text-gray-800 leading-relaxed">{fb.content}</p>
                      </div>
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
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <p className="mt-2 text-gray-500">Chưa có đánh giá nào cho bác sĩ này.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
