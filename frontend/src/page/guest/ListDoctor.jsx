import React, { useEffect, useState } from "react";
import Header from "../../components/guestlayout/Header";
import Footer from "../../components/guestlayout/Footer";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";
import { useNavigate } from "react-router-dom";

export default function ListDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const StarRating = ({ rating, totalReviews }) => {
  const fullStars = Math.floor(rating); // làm tròn xuống
  const hasHalfStar = rating - fullStars > 0 ? 1 : 0;

  
  const displayFullStars = fullStars > 4 ? 5 : fullStars;
  const displayHalfStar = displayFullStars < 4 && hasHalfStar ? 1 : 0;
  const displayEmptyStars = 5 - (displayFullStars + displayHalfStar);

  return (
    <div className="flex items-center gap-2 mt-2">
      {Array.from({ length: displayFullStars }).map((_, i) => (
        <span key={"full" + i} style={{ color: "#01875F", fontSize: "20px" }}>★</span>
      ))}
      {displayHalfStar === 1 && (
        <span key="half" style={{
          color: "#01875F",
          fontSize: "20px",
          position: "relative",
          display: "inline-block",
          width: "20px",
          overflow: "hidden"
        }}>
          <span style={{ position: "absolute", left: 0, width: "10px", overflow: "hidden" }}>★</span>
          <span style={{ color: "#d1d5db", marginRight: "10px" }}>★</span>
        </span>
      )}
      
      {Array.from({ length: displayEmptyStars }).map((_, i) => (
        <span key={"empty" + i} style={{ color: "#d1d5db", fontSize: "20px" }}>★</span>
      ))}
      <span className="ml-2 text-gray-700 font-medium text-base">
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
                const doctorId = doctor.id ?? idx;

                return (
                  <React.Fragment key={doctor.id ?? idx}>
                    <button onClick={() => navigate(`/doctor/${doctorId}/feedback`)} className="w-full text-left">
                      <div className="flex items-center gap-6 p-6 hover:bg-white rounded-lg transition-colors">
                        <img
                          src={avatar}
                          alt="avatar"
                          className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover flex-shrink-0 shadow-md"
                          onError={(e) => {
                            e.target.src = "https://randomuser.me/api/portraits/men/32.jpg";
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-bold text-2xl mb-2">{name}</div>
                          <div className="text-gray-600 text-base mb-3">{speciality}</div>
                          <StarRating rating={rating} totalReviews={totalReviews} />
                        </div>
                      </div>
                    </button>
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
