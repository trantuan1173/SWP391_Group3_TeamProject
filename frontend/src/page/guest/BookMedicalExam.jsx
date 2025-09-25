import React, { useState } from "react";
import Header from "../../components/Header"; // Đường dẫn tới Header.jsx
import { API_ENDPOINTS } from '../../config';
import axios from 'axios';

export default function BookMedicalExam() {
  const [name, setName] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');

  const payload = {
    name,
    identityNumber,
    phoneNumber,
    date,
    startTime,
    endTime
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!name || !identityNumber || !phoneNumber || !date || !startTime) {
      setMessage("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    try {
      const response = await axios.post(API_ENDPOINTS.CREATE_APPOINTMENT_WITHOUT_LOGIN, payload);
      if (!response.data) {
        setMessage('Đăng kí thất bại. Vui lòng thử lại.');
        return;
      }
      alert('Đăng kí thành công!');
      console.log(response.data);
    } catch (error) {
      alert('Đăng kí thất bại. Vui lòng thử lại.');
      console.error(error);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f6fff4] pt-8 px-4">
        <h1 className="text-center text-2xl md:text-[40px] font-bold mb-8">
          ĐĂNG KÍ KHÁM BỆNH
        </h1>
  
        <div className="max-w-6xl mx-auto rounded-xl bg-[#f6fff4] p-6 md:p-8 mt-[30px]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Form */}
            <form
              onSubmit={handleSubmit}
              className="md:col-span-7 flex flex-col gap-6"
            >
              <div>
                <label className="block mb-2 text-base font-medium text-gray-800">
                  Họ và tên
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Nhập họ và tên"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-2 text-base font-medium text-gray-800">
                  CCCD
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Nhập CCCD"
                  type="text"
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-2 text-base font-medium text-gray-800">
                  Số điện thoại
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Nhập số điện thoại"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              {/* Move the submit button inside the form */}
              
            </form>
  
            {/* Right Form */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full bg-[#ede9fe] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl md:text-2xl font-semibold text-gray-800">
                    Chọn ngày & giờ
                  </span>
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="4" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
  
                <div className="flex flex-col gap-4">
                  {/* Date */}
                  <div>
                    <label className="block text-gray-700 text-base mb-1">
                      Ngày
                    </label>
                    <input
                      type="date"
                      className="w-full border-2 border-purple-400 rounded-lg px-4 py-2 text-lg focus:outline-none"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
  
                  {/* Time */}
                  <div>
                    <label className="block text-gray-700 text-base mb-1">
                      Giờ
                    </label>
                    <input
                      type="time"
                      className="w-full border-2 border-purple-400 rounded-lg px-4 py-2 text-lg focus:outline-none"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-red-500 text-sm mt-[25px]">
                {message}
              </p>
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full md:w-[60%] mx-auto bg-green-900 text-white font-bold py-3 rounded-[999px] text-base hover:bg-green-800 transition mt-4"
                style={{ borderRadius: "10px" }}
              >
                ĐĂNG KÍ KHÁM BỆNH
              </button>
          <p className="text-center text-gray-600 text-sm mt-[25px]">
            *Vui lòng đăng kí lịch khám mong muốn và điền chính xác thông tin, chúng tôi sẽ kiểm tra và liên hệ để xác nhận với quý khách
          </p>
        </div>
      </div>
    </>
  );
}
