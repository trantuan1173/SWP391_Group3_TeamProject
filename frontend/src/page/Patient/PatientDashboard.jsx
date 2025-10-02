import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useParams } from "react-router-dom"; // 👈 để lấy param từ URL
import Sidebar from "../../components/layout/Sidebar";
import PatientInfo from "./components/PatientInfo";
import Prescriptions from "./components/Prescriptions";
import Checkups from "./components/Checkups";
import Documents from "./components/Documents";
import Payments from "./components/Payments";
import { API_ENDPOINTS } from '../../config';


export default function PatientDashboard() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Prescription");
  const tabs = ["Prescription", "Checkups", "Document's", "Payments"];
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(API_ENDPOINTS.GET_PATIENT_BY_ID(id), {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          const errorText = await res.text();
          setError(errorText || "Không tìm thấy bệnh nhân hoặc ID không hợp lệ.");
          setPatient(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setPatient(data);
        setError(null);
      } catch (err) {
        setError("Lỗi kết nối server hoặc ID không hợp lệ.");
        setPatient(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
    else {
      setError("Không có ID bệnh nhân trên URL.");
      setPatient(null);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-500 animate-pulse">Đang tải dữ liệu bệnh nhân...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
          </svg>
          <h2 className="text-xl font-bold text-red-600 mb-2">Không tìm thấy bệnh nhân</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <a href="/" className="px-6 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition">Quay về trang chủ</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar patient={patient} />
      <div className="flex-1 flex flex-col rounded-l-3xl overflow-hidden">
        <header className="bg-white px-8 py-4 shadow flex items-center justify-between">
          {/* Search */}
          <div className="flex items-center border rounded-full overflow-hidden w-[420px] bg-gray-50">
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 px-3 py-2 bg-transparent outline-none text-sm"
            />
          </div>
          <div className="w-10 h-10 border rounded-full flex items-center justify-center bg-gray-50">
            <Clock size={20} className="text-gray-600" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <PatientInfo patient={patient} />

          {['Checkups', "Document's", 'Payments'].includes(activeTab) && (
            <h2 className="text-lg font-semibold text-center mb-4">January</h2>
          )}

          <div className="flex gap-3 mb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-medium shadow transition ${
                  activeTab === tab
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            {activeTab === 'Prescription' && (
              <Prescriptions data={patient.prescriptions || []} />
            )}
            {activeTab === 'Checkups' && (
              <Checkups data={patient.checkups || []} />
            )}
            {activeTab === "Document's" && (
              <Documents data={patient.documents || []} />
            )}
            {activeTab === 'Payments' && (
              <Payments data={patient.payments || []} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
