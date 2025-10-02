import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import PatientInfo from "./components/PatientInfo";

export default function CreateAppointment() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:1118/api/patients/${id}`)
      .then(res => res.json())
      .then(data => setPatient(data))
      .catch(() => setPatient(null));
  }, [id]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar patient={patient} />
      <div className="flex-1 flex flex-col rounded-l-3xl overflow-hidden">
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-10 text-center">
            ĐĂNG KÍ LỊCH KHÁM
          </h1>
<div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
        
            <PatientInfo patient={patient} />
            <form className="flex flex-col gap-6">
              <div className="bg-indigo-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-semibold text-gray-800">
                    Chọn ngày & giờ
                  </span>
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-600"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="4" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="w-full bg-green-400 text-white font-semibold py-3 rounded-lg cursor-not-allowed"
              >
                ĐĂNG KÍ LỊCH KHÁM
              </button>
            </form>
            <p className="text-center text-gray-600 text-sm mt-6">
              *Vui lòng chọn lịch khám mong muốn, chúng tôi sẽ kiểm tra và liên hệ để xác nhận với quý khách
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}