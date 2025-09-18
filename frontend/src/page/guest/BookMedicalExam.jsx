import React, { useState } from "react";
import Header from "../../components/Header"; // Đường dẫn tới Header.jsx

export default function BookMedicalExam() {
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(1);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f6fff4] pt-8">
        <h1 className="text-center text-[40px] font-bold mb-8">ĐĂNG KÍ KHÁM BỆNH</h1>
        <div className="w-[70%] mx-auto rounded-xl bg-[#f6fff4] p-8 mt-[50px]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Form: 6 cột */}
            <form className="md:col-span-6 flex flex-col justify-center gap-6">
              <div>
                <label className="block mb-2 text-base font-medium text-gray-800">Họ và tên</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Value"
                  type="text"
                />
              </div>
              <div>
                <label className="block mb-2 text-base font-medium text-gray-800">CCCD</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Value"
                  type="text"
                />
              </div>
              <div>
                <label className="block mb-2 text-base font-medium text-gray-800">Số điện thoại</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Value"
                  type="text"
                />
              </div>
              <div>
                <label className="block mb-2 text-base font-medium text-gray-800">Ngày sinh</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Value"
                  type="text"
                />
              </div>
              <button
                type="submit"
                className="w-[60%] mx-auto bg-green-900 text-white font-bold py-3 rounded-[999px] text-base hover:bg-green-800 transition"
                style={{borderRadius: "10px"}}
              >
                ĐĂNG KÍ KHÁM BỆNH
              </button>
              
            </form>
            {/* Khoảng trống giữa: 2 cột */}
            <div className="md:col-span-2"></div>
            {/* Right Form: 4 cột */}
            <div className="md:col-span-4 flex flex-col gap-8 items-center">
              {/* Date Picker */}
              <div className="w-full bg-[#ede9fe] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-semibold text-gray-800">Enter date</span>
                  <span>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="4" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </span>
                </div>
                <div className="mt-4">
                  <label className="block text-gray-700 text-base mb-1">Date</label>
                  <input
                    type="text"
                    placeholder="mm/dd/yyyy"
                    className="w-full border-2 border-purple-400 rounded-lg px-4 py-2 text-lg focus:outline-none"
                  />
                </div>
              </div>
              {/* Time Picker */}
              <div className="w-full bg-[#ede9fe] rounded-2xl p-6 mt-2">
                <div className="text-2xl font-semibold text-gray-800 mb-2">Enter time</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={2}
                    className="w-16 border-2 border-purple-400 rounded-lg px-2 py-2 text-2xl text-center focus:outline-none"
                    placeholder="20"
                  />
                  
                  <span className="text-2xl font-bold">:</span>
                  <input
                    type="text"
                    maxLength={2}
                    className="w-16 border-2 border-purple-400 rounded-lg px-2 py-2 text-2xl text-center focus:outline-none"
                    placeholder="00"
                  />
                  <div className="flex flex-col gap-1 ml-4">
                    <button className="bg-pink-200 text-gray-800 px-3 py-1 font-semibold" style={{ borderRadius: "10px" }}>
                      AM
                    </button>
                    <button className="bg-pink-200 text-gray-800 px-3 py-1 font-semibold" style={{ borderRadius: "10px" }}>
                      PM
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  
                  <div className="flex gap-4">
                    <button className="text-purple-500 font-semibold">Cancel</button>
                    <button className="text-purple-500 font-semibold">OK</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
            <div className="text-center text-gray-600 text-sm mt-[25px]">
                *Vui lòng đăng kí lịch khám mong muốn và điền chính xác thông tin, chúng tôi sẽ kiểm tra và liên hệ để xác nhận với quý khách
            </div>
        </div>
      </div>
    </>
  );
}