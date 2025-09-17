import React, { useState } from "react";
import Header from "../../components/Header"; // Đường dẫn tới Header.jsx

const dates = [
  { label: "16/09", sub: "Thứ 3", active: true },
  { label: "17/09", sub: "Thứ 4" },
  { label: "18/09", sub: "Thứ 5" },
  { label: "Ngày khác", icon: true },
];

const times = [
  "07:00", "08:00", "09:00", "10:00", "11:00",
  "13:30", "14:30", "15:30", "16:30"
];

export default function BookMedicalExam() {
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(1);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f6fff4] pt-8">
        <div className="w-[80%] mx-auto border border-gray-200 rounded-xl bg-[#f6fff4] p-8 mt-[50px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Form */}
            <div className="flex flex-col gap-[10px]">
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Họ và tên (*)"
                type="text"
              />
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Ngày sinh (d/m/Y)"
                type="text"
              />
              <select className="w-full border border-gray-300 rounded px-3 py-2">
                <option>Giới tính</option>
                <option>Nam</option>
                <option>Nữ</option>
                <option>Khác</option>
              </select>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Số điện thoại (*)"
                type="text"
              />
              <div className="flex gap-2">
                <select className="w-1/2 border border-gray-300 rounded px-3 py-2">
                  <option>Tỉnh thành</option>
                </select>
                <select className="w-1/2 border border-gray-300 rounded px-3 py-2">
                  <option>Phường xã</option>
                </select>
              </div>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                rows={3}
                placeholder="Mô tả triệu chứng (*)"
                style={{ height: "120px" }}
              />
            </div>
            {/* Right Booking */}
            <div className="bg-white rounded-md border border-gray-200 p-4 flex flex-col gap-4">
              <div>
                <label className="font-semibold text-gray-700">Ngày khám <span className="text-red-500">*</span></label>
                <div className="flex gap-[15px] mt-2 ">
                  {dates.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(i)}
                      className={`px-4 py-2 rounded-md border text-sm flex flex-col items-center gap-1 min-w-[80px]
                        ${selectedDate === i
                          ? "bg-green-50 border-green-500 text-green-700 font-bold"
                          : "bg-white border-gray-300 text-gray-700"}
                      `}
                      style={{ borderRadius: "10px" }}
                    >
                      <span>{d.label}</span>
                      {d.icon && (
                        <svg className="w-4 h-4 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-5 4h.01M21 21V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2z" />
                        </svg>
                      )}
                      <span className="text-xs text-gray-500">{d.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Giờ khám <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-5 gap-[15px] mt-2">
                  {times.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTime(i)}
                      className={`px-2 py-2 border-[1px] text-sm font-medium w-full`
                        + ` ${selectedTime === i
                          ? "bg-green-50 border-green-500 text-green-700 font-bold"
                          : "bg-white border-gray-300 text-gray-700"}`
                      }
                      style={{ height: "65px", borderRadius: "10px" }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                </div>
                <div className="text-xs text-gray-700 mt-2">
                    <b>Lưu ý:</b> Thời gian khám trên chỉ là thời gian dự kiến, tổng đài sẽ liên hệ xác nhận thời gian khám chính xác tới quý khách sau khi quý khách đặt hẹn
                </div>
                <div className="flex justify-end mt-8">
                <button className="bg-green-500 text-white font-bold py-3 rounded text-lg hover:bg-green-600 transition"
              style={{ width: "100%" }}>
              Đặt lịch
            </button>
          </div>
            </div>
            
          </div>
          
          
        </div>
      </div>
    </>
  );
}