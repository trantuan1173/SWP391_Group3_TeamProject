import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";
// Sửa lỗi: Thay thế 'react-icons/fa' bằng 'lucide-react'
import { Search, User, History, ChevronDown } from "lucide-react";

// API Endpoints
const API_ENDPOINTS = {
  GET_ALL_PATIENTS: "https://swp.gicunhco.com/api/admin/patients/get-all",
  GET_MEDICAL_RECORDS: (patientId) => `https://swp.gicunhco.com/api/appointments/patient/${patientId}`,
};

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState({}); 

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Hàm helper để định dạng hiển thị tiền tệ
  // const formatCurrency = (amount) => amount ? new Intl.NumberFormat("vi-VN").format(amount) + " VND" : "N/A"; // Hiện tại không dùng
  const formatDate = (dateString) => dateString ? dayjs(dateString).format("DD/MM/YYYY") : "N/A";
  const formatTime = (timeString) => timeString ? timeString.substring(0, 5) : "N/A";

  // Hàm helper để xác định style dựa trên trạng thái
  const getStatusStyles = (status) => {
    if (!status) return 'bg-gray-100 text-gray-700 border-gray-300';
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const fetchPatients = async (query) => {
    setLoading(true);
    setExpandedPatientId(null);
    setPatients([]); // Clear previous results

    try {
      const response = await axios.get(API_ENDPOINTS.GET_ALL_PATIENTS, {
        params: { search: query },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.patients) {
        setPatients(response.data.patients);
        if (query && response.data.patients.length === 0) {
          toast.success("Không tìm thấy bệnh nhân nào khớp với từ khóa.");
        }
      } else {
        toast.error("Lỗi khi lấy danh sách bệnh nhân.");
      }
    } catch (error) {
      console.error("Fetch patients failed:", error);
      toast.error("Lỗi kết nối hoặc server khi lấy bệnh nhân.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalRecords = async (patientId) => {
    // Chỉ fetch nếu chưa có dữ liệu
    if (medicalRecords[patientId]) return;

    try {
      const response = await axios.get(API_ENDPOINTS.GET_MEDICAL_RECORDS(patientId), {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Lấy dữ liệu từ response.data.data
      if (response.data && response.data.data) {
        const records = response.data.data;

        // Sắp xếp hồ sơ theo ngày giờ mới nhất trước
        const sortedRecords = records.sort((a, b) => {
          const dateA = dayjs(`${a.date} ${a.startTime}`);
          const dateB = dayjs(`${b.date} ${b.startTime}`);
          return dateB.diff(dateA); // Descending sort (newest first)
        });

        setMedicalRecords((prev) => ({ ...prev, [patientId]: sortedRecords }));
      } else {
        setMedicalRecords((prev) => ({ ...prev, [patientId]: [] }));
      }
    } catch (error) {
      console.error("Fetch medical records failed:", error);
      toast.error("Không thể lấy hồ sơ bệnh án.");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        fetchPatients(searchTerm.trim());
    } else {
        toast.error("Vui lòng nhập từ khóa tìm kiếm.");
    }
  };

  const toggleMedicalRecords = (patientId) => {
    setExpandedPatientId(expandedPatientId === patientId ? null : patientId);
    if (expandedPatientId !== patientId) {
      fetchMedicalRecords(patientId);
    }
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-8xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-8 border-b pb-4 flex items-center">
          <User className="w-6 h-6 mr-3 text-blue-500" /> Quản lý Hồ sơ Bệnh nhân
        </h1>

        <form onSubmit={handleSearchSubmit} className="mb-10">
          <div className="flex items-center border-2 border-blue-500 rounded-xl overflow-hidden shadow-lg">
            <input
              type="text"
              placeholder="Nhập Tên, SĐT, hoặc Mã định danh để tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 text-gray-800 text-lg focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-4 text-white font-semibold transition-all duration-200 flex items-center justify-center ${
                loading ? "bg-gray-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? 
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                : <><Search className="w-5 h-5 mr-2" /> Tìm kiếm</>
              }
            </button>
          </div>
        </form>

        <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full mr-2">{patients.length}</span> 
          Kết quả tìm kiếm
        </h2>

        {patients.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-12 border-4 border-dashed border-gray-200 rounded-xl bg-gray-50">
            {!searchTerm
              ? "Vui lòng nhập từ khóa để bắt đầu tìm kiếm bệnh nhân."
              : "Không tìm thấy hồ sơ bệnh nhân nào khớp với từ khóa đã nhập."
            }
          </div>
        )}

        {patients.map((patient) => (
          <div key={patient.id} className="mb-8 p-6 border-2 border-gray-200 rounded-xl shadow-lg bg-white transition duration-300 hover:shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6 text-sm text-gray-700">
              <p className="col-span-1 md:col-span-3 text-lg font-semibold text-blue-600">
                <User className="inline w-4 h-4 mr-2 text-blue-500"/>{patient.name}
              </p>
              <p><strong>SĐT:</strong> {patient.phoneNumber}</p>
              <p>
                <strong>Ngày sinh:</strong> {formatDate(patient.dateOfBirth)} 
                <span className="ml-2 font-medium">({patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'})</span>
              </p>
              <p className="md:col-span-1"><strong>Mã BN:</strong> {patient.id}</p>
              <p className="md:col-span-3"><strong>Email:</strong> {patient.email}</p>
            </div>

            <hr className="my-5 border-gray-100" />

            <button
              onClick={() => toggleMedicalRecords(patient.id)}
              className="flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-2 rounded-lg"
            >
              <History className="w-4 h-4 mr-2" /> 
              {medicalRecords[patient.id]?.length || 0} Hồ sơ Lịch hẹn đã khám 
              <ChevronDown className={`ml-3 transform transition-transform ${expandedPatientId === patient.id ? 'rotate-180' : 'rotate-0'} w-4 h-4`} />
            </button>

            {expandedPatientId === patient.id && (
              <div className="mt-5 space-y-4">
                {medicalRecords[patient.id]?.length > 0 ? (
                  medicalRecords[patient.id].map((record, index) => (
                    <div
                      key={record.id}
                      onClick={() => navigate(`/receptionist/appointments/${record.id}`)}
                      className="border border-indigo-300 rounded-xl p-4 bg-white shadow-md cursor-pointer hover:bg-indigo-50 transition"
                    >
                      <h4 className="font-bold text-indigo-700 mb-3 border-b pb-2 flex justify-between items-center text-base">
                        <span>Lịch hẹn gần nhất thứ {index + 1} ({formatDate(record.date)})</span>
                        {/* Thêm Mã Lịch Hẹn */}
                        <span className="text-sm font-normal text-gray-500">
                           Mã Lịch Hẹn: <strong className="text-gray-700">{record.id}</strong>
                        </span>
                      </h4>

                      <div className="grid grid-cols-2 text-sm gap-2">
                        <p><strong>Bác sĩ:</strong> {record.Employee?.name}</p>
                        <p><strong>Phòng khám:</strong> {record.Room?.name} ({record.Room?.type})</p>

                        <p><strong>Thời gian:</strong> {formatTime(record.startTime)} - {formatTime(record.endTime)}</p>
                        <p>
                          <strong>Trạng thái:</strong>
                          {/* Áp dụng styling động cho Trạng thái */}
                          <span className={`inline-block ml-2 px-3 py-0.5 text-xs font-semibold rounded-full border ${getStatusStyles(record.status)}`}>
                              {record.status.toUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <History className="inline w-4 h-4 mr-2" /> Chưa có hồ sơ lịch hẹn nào được tạo cho bệnh nhân này.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}