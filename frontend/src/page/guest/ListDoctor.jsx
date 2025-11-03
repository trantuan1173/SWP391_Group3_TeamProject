import React, { useEffect, useState } from "react";
import Header from "../../components/guestlayout/Header";
import Footer from "../../components/guestlayout/Footer";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";

export default function ListDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const doctorUrl = API_ENDPOINTS?.DOCTOR_LIST || "/api/doctors";
        const res = await axios.get(doctorUrl);
        const list = Array.isArray(res.data) ? res.data : [];
        setDoctors(list);

        const specialtyCount = {};
        list.forEach(doctor => {
          const specialty = doctor.speciality || "Chưa có chuyên khoa";
          specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
        });

        const specialtyList = Object.entries(specialtyCount).map(([name, count]) => ({
          name,
          doctorCount: count
        }));

        setSpecialties(specialtyList);
      } catch (err) {
        console.error("Fetch doctors error:", err);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Component hiển thị sao đánh giá
  const StarRating = ({ rating, totalReviews }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">★</span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400">⯨</span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">★</span>
        );
      }
    }

    return (
      <div className="flex items-center gap-1 text-sm">
        <div className="flex">{stars}</div>
        <span className="text-gray-600">
          {rating > 0 ? `${rating} (${totalReviews} đánh giá)` : 'Chưa có đánh giá'}
        </span>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="bg-[#f6fff4] min-h-screen pt-8">
        <div className="w-[70%] mx-auto flex flex-row gap-8 mt-[30px]">
          <div className="flex-1">
            <div className="text-lg font-bold mb-4">Danh Sách Bác Sĩ</div>

            {loading && <div className="text-gray-600 mb-4">Đang tải dữ liệu...</div>}

            <div className="space-y-6">
  {!loading && doctors.length === 0 && (
    <div className="text-gray-500">Không có dữ liệu bác sĩ.</div>
  )}

  {doctors.map((doctor, idx) => {
    const name = doctor.name || "Chưa có tên";
    const avatar = doctor.avatar || "https://randomuser.me/api/portraits/men/32.jpg";
    const speciality = doctor.speciality || "Chưa có chuyên khoa";
    const rating = doctor.rating || 0;
    const totalReviews = doctor.totalReviews || 0;

    return (
      <React.Fragment key={doctor.id ?? idx}>
        <div className="flex items-center gap-6 p-6 hover:bg-white rounded-lg transition-colors">
          {/* Avatar lớn hơn */}
          <img
            src={avatar}
            alt="avatar"
            className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover flex-shrink-0 shadow-md"
            onError={(e) => {
              e.target.src = "https://randomuser.me/api/portraits/men/32.jpg";
            }}
          />
          
          {/* Thông tin bác sĩ */}
          <div className="flex-1">
            <div className="font-bold text-2xl mb-2">{name}</div>
            <div className="text-gray-600 text-base mb-3">{speciality}</div>
            <StarRating rating={rating} totalReviews={totalReviews} />
          </div>
        </div>
        <hr className="border-gray-200" />
      </React.Fragment>
    );
  })}
</div>

          </div>

          <div className="w-[300px]">
            <div className="bg-[#ffe3d1] rounded-xl shadow-md p-6">
              <div className="font-bold text-lg mb-4">Chuyên Khoa</div>
              <div className="space-y-3 text-gray-800 text-base">
                {specialties.map((speciality, index) => (
                  <div className="flex justify-between" key={index}>
                    <span>{speciality.name}</span>
                    <span>{speciality.doctorCount} Bác Sĩ</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
