import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";

export default function ListDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const doctorUrl = API_ENDPOINTS?.DOCTOR_LIST || "/api/doctor";
        const res = await axios.get(doctorUrl);
        console.log("doctor response:", res);
        // hỗ trợ nhiều dạng response
        const list =
          Array.isArray(res.data) ||
          Array.isArray(res.data?.doctors) ||
          Array.isArray(res.data?.data)
            ? res.data
            : [];
        setDoctors(list);
      } catch (err) {
        console.error("Fetch doctors error:", err);
        setDoctors([]); // không hiển thị lỗi đỏ, chỉ để danh sách rỗng
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
                // lấy thông tin từ chính object doctor
                const user = doctor.User || {}; // Sửa lại để lấy thông tin từ User
                const name = user.name || "Chưa có tên"; // Lấy tên từ đối tượng User
                const avatar = user.avatar || "https://randomuser.me/api/portraits/men/32.jpg"; // Lấy avatar từ đối tượng User
                const speciality = doctor.speciality || "Chưa có chuyên khoa"; // Lấy chuyên khoa

                return (
                  <React.Fragment key={doctor.id ?? idx}>
                    <div className="flex items-center gap-4">
                      <img
                        src={avatar}
                        alt="avatar"
                        className="w-12 h-12 rounded-full border-2 border-gray-300"
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
                <div className="flex justify-between">
                  <span>Sản Phụ Khoa</span>
                  <span>15 Bác Sĩ</span>
                </div>
                <div className="flex justify-between">
                  <span>Mắt</span>
                  <span>20 Bác Sĩ</span>
                </div>
                <div className="flex justify-between">
                  <span>Tai - Mũi - Họng</span>
                  <span>10 Bác Sĩ</span>
                </div>
                <div className="flex justify-between">
                  <span>Nhi</span>
                  <span>10 Bác Sĩ</span>
                </div>
                <div className="flex justify-between">
                  <span>Cơ Xương Khớp</span>
                  <span>10 Bác Sĩ</span>
                </div>
                <div className="flex justify-between">
                  <span>Nội Tim Mạch</span>
                  <span>10 Bác Sĩ</span>
                </div>
                <div className="flex justify-between">
                  <span>Thần Kinh</span>
                  <span>10 Bác Sĩ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
