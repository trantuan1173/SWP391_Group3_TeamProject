import React, { useEffect, useState } from "react";
import Header from "../../components/guestlayout/Header";
import Footer from "../../components/guestlayout/Footer";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";

export default function ListDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]); // Khai báo state cho chuyên khoa
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const doctorUrl = API_ENDPOINTS?.DOCTOR_LIST || "/api/doctors";
        const res = await axios.get(doctorUrl);
        console.log("doctor response:", res);
        console.log("doctor data:", res.data); 
        // console.log("first doctor avatar:", res.data[0]?.employee?.avatar);
        const list = Array.isArray(res.data) ? res.data : [];
        setDoctors(list);

         const specialtyCount = {};
        list.forEach(doctor => {
          const specialty = doctor.speciality || "Chưa có chuyên khoa";
          specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
        });

        // Chuyển object thành array để hiển thị
        const specialtyList = Object.entries(specialtyCount).map(([name, count]) => ({
          name,
          doctorCount: count
        }));

        setSpecialties(specialtyList);
        console.log("Specialty count:", specialtyList);
      } catch (err) {
        console.error("Fetch doctors error:", err);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <>
      <Header />
      <div className="bg-[#f6fff4] min-h-screen pt-8">
        <div className="w-[80%] mx-auto flex flex-row gap-8 mt-[30px]">
          <div className="flex-1">
            <div className="text-lg font-bold mb-4">Danh Sách Bác Sĩ</div>

            {loading && <div className="text-gray-600 mb-4">Đang tải dữ liệu...</div>}

            <div className="space-y-6">
              {!loading && doctors.length === 0 && (
                <div className="text-gray-500">Không có dữ liệu bác sĩ.</div>
              )}

              {doctors.map((doctor, idx) => {
                const employee = doctor.employee || {}; // lấy thông tin employee bên trong doctor
                const name = doctor.name || "Chưa có tên"; // lấy tên
                const avatar = doctor.avatar || "https://randomuser.me/api/portraits/men/32.jpg"; // lấy avatar
                const speciality = doctor.speciality || "Chưa có chuyên khoa"; // lấy tên chuyên khoa

                return (
                  <React.Fragment key={doctor.id ?? idx}>
                    <div className="flex items-center gap-4">
                      <img
                        src={avatar}
                        alt="avatar"
                        className="w-12 h-12 rounded-full border-2 border-gray-300 object-cover"

                        onError={(e) => {

                          console.error("Image load error:", avatar);

                          e.target.src = "https://randomuser.me/api/portraits/men/32.jpg";

                        }}
                      />
                      <div>
                        <div className="font-bold text-base">{name}</div>
                        <div className="text-gray-600 text-sm">{speciality}</div>
                      </div>
                    </div>
                    <hr />
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
                    <span>{speciality.doctorCount} Bác Sĩ</span> {/* Hiển thị số bác sĩ */}
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
